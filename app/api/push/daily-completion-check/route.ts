// File: app/api/push/daily-completion-check/route.ts
// Endpoint para recordatorio diario a las 6 PM verificando intenciones del día

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification, NotificationPayload } from '@/lib/push-notifications';

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function shouldCheckToday(periodicity: string, customDays?: string[]): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayName = DAYS_ES[dayOfWeek];

    switch (periodicity) {
        case 'daily':
            return true;
        case 'weekly':
            return dayOfWeek === 1; // Monday
        case 'custom':
            if (!customDays || customDays.length === 0) return false;
            return customDays.some(d => d.toLowerCase() === dayName);
        case 'one_time':
        default:
            return false;
    }
}

export async function GET(req: Request) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Get all If-Then tasks with periodicity that should run today
        const { data: tasks, error } = await supabaseAdmin
            .from('tasks')
            .select(`
                id,
                title,
                trigger_if,
                action_then,
                periodicity,
                custom_days,
                user_id,
                status,
                last_completed_at
            `)
            .not('trigger_if', 'is', null)
            .not('action_then', 'is', null)
            .neq('periodicity', 'one_time')
            .neq('status', 'completed');

        if (error) {
            console.error('Error fetching tasks:', error);
            return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
        }

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ success: true, checked: 0, sent: 0 });
        }

        // Group incomplete tasks by user (that should run today)
        const userIncompleteTasks: Record<string, typeof tasks> = {};

        for (const task of tasks) {
            const customDays = task.custom_days ? JSON.parse(task.custom_days) : [];

            if (shouldCheckToday(task.periodicity, customDays)) {
                // Check if completed today
                const lastCompleted = task.last_completed_at ? new Date(task.last_completed_at) : null;
                const isCompletedToday = lastCompleted && lastCompleted >= today && lastCompleted <= todayEnd;

                if (!isCompletedToday) {
                    if (!userIncompleteTasks[task.user_id]) {
                        userIncompleteTasks[task.user_id] = [];
                    }
                    userIncompleteTasks[task.user_id].push(task);
                }
            }
        }

        let notificationsSent = 0;

        // Send notification to each user with pending tasks
        for (const [userId, userTasks] of Object.entries(userIncompleteTasks)) {
            const { data: subscriptions } = await supabaseAdmin
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId);

            if (!subscriptions || subscriptions.length === 0) continue;

            const taskCount = userTasks.length;
            let title = '';
            let body = '';

            if (taskCount === 1) {
                title = '✅ ¿Completaste tu intención de hoy?';
                body = `Si ${userTasks[0].trigger_if} → ${userTasks[0].action_then}`;
            } else {
                title = '✅ Verifica tus intenciones del día';
                body = `Tienes ${taskCount} intenciones pendientes. ¿Las completaste?`;
            }

            const payload: NotificationPayload = {
                title,
                body,
                icon: '/icons/icon-192x192.png',
                tag: 'daily-completion-check',
                data: {
                    url: '/dashboard',
                    type: 'daily_completion_reminder',
                    taskCount,
                },
                actions: [
                    { action: 'view', title: '📋 Ver pendientes' },
                    { action: 'dismiss', title: '✓ Todo listo' },
                ],
            };

            for (const sub of subscriptions) {
                const subscription = {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                };

                try {
                    await sendPushNotification(subscription, payload);
                    notificationsSent++;
                } catch (error) {
                    console.error('Failed to send notification:', error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            checked: tasks.length,
            usersNotified: Object.keys(userIncompleteTasks).length,
            sent: notificationsSent,
        });
    } catch (error: any) {
        console.error('Error in daily completion check:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
