// File: app/api/push/check-notifications/route.ts
// This endpoint can be called by a cron job or edge function to check for pending notifications

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification, NotificationPayload } from '@/lib/push-notifications';

export async function GET(req: Request) {
    try {
        // Create Supabase admin client inside the function to avoid build-time errors
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // 1. Check for tasks due today
        const { data: tasksDueToday } = await supabaseAdmin
            .from('tasks')
            .select('id, title, user_id, due_date')
            .gte('due_date', today.toISOString())
            .lte('due_date', todayEnd.toISOString())
            .neq('status', 'completed');

        // 2. Check for overdue tasks
        const { data: overdueTasks } = await supabaseAdmin
            .from('tasks')
            .select('id, title, user_id, due_date')
            .lt('due_date', today.toISOString())
            .neq('status', 'completed');

        // Group notifications by user
        const userNotifications: Record<string, { dueToday: typeof tasksDueToday; overdue: typeof overdueTasks }> = {};

        tasksDueToday?.forEach(task => {
            if (!userNotifications[task.user_id]) {
                userNotifications[task.user_id] = { dueToday: [], overdue: [] };
            }
            userNotifications[task.user_id].dueToday?.push(task);
        });

        overdueTasks?.forEach(task => {
            if (!userNotifications[task.user_id]) {
                userNotifications[task.user_id] = { dueToday: [], overdue: [] };
            }
            userNotifications[task.user_id].overdue?.push(task);
        });

        let notificationsSent = 0;

        // Send notifications to each user
        for (const [userId, tasks] of Object.entries(userNotifications)) {
            const { data: subscriptions } = await supabaseAdmin
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId);

            if (!subscriptions || subscriptions.length === 0) continue;

            // Build notification message
            const overdueCount = tasks.overdue?.length || 0;
            const dueTodayCount = tasks.dueToday?.length || 0;

            let title = '';
            let body = '';

            if (overdueCount > 0 && dueTodayCount > 0) {
                title = '⚠️ Tareas pendientes';
                body = `Tienes ${overdueCount} tarea(s) vencida(s) y ${dueTodayCount} para hoy`;
            } else if (overdueCount > 0) {
                title = '⚠️ Tareas vencidas';
                body = `Tienes ${overdueCount} tarea(s) vencida(s)`;
            } else if (dueTodayCount > 0) {
                title = '📅 Tareas para hoy';
                body = `Tienes ${dueTodayCount} tarea(s) para completar hoy`;
            }

            if (!title) continue;

            const payload: NotificationPayload = {
                title,
                body,
                icon: '/icons/icon-192x192.png',
                tag: 'daily-reminder',
                data: { url: '/dashboard' },
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
                    console.error('Failed to send to subscription:', error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            checked: Object.keys(userNotifications).length,
            sent: notificationsSent,
        });
    } catch (error: any) {
        console.error('Error checking notifications:', error);
        return NextResponse.json(
            { error: 'Failed to check notifications' },
            { status: 500 }
        );
    }
}
