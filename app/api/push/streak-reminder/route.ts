// File: app/api/push/streak-reminder/route.ts
// Endpoint para recordatorio de rachas en peligro a las 8 PM

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification, NotificationPayload } from '@/lib/push-notifications';

export async function GET(req: Request) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all tasks with active streaks (≥3 days)
        const { data: tasks, error } = await supabaseAdmin
            .from('tasks')
            .select(`
                id,
                title,
                trigger_if,
                action_then,
                user_id,
                current_streak,
                best_streak
            `)
            .not('trigger_if', 'is', null)
            .not('action_then', 'is', null)
            .gte('current_streak', 3)
            .neq('status', 'completed');

        if (error) {
            console.error('Error fetching tasks:', error);
            return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
        }

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ success: true, checked: 0, sent: 0 });
        }

        // Get today's habit marks to check if already completed
        const taskIds = tasks.map(t => t.id);
        const { data: todayMarks } = await supabaseAdmin
            .from('habit_day_marks')
            .select('task_id')
            .in('task_id', taskIds)
            .gte('marked_date', today.toISOString());

        const completedTaskIds = new Set(todayMarks?.map(m => m.task_id) || []);

        // Group tasks by user - only those not marked today
        const userStreaksAtRisk: Record<string, typeof tasks> = {};

        for (const task of tasks) {
            if (!completedTaskIds.has(task.id)) {
                if (!userStreaksAtRisk[task.user_id]) {
                    userStreaksAtRisk[task.user_id] = [];
                }
                userStreaksAtRisk[task.user_id].push(task);
            }
        }

        let notificationsSent = 0;

        // Send notifications
        for (const [userId, userTasks] of Object.entries(userStreaksAtRisk)) {
            const { data: subscriptions } = await supabaseAdmin
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId);

            if (!subscriptions || subscriptions.length === 0) continue;

            // Find the longest streak at risk
            const longestStreak = Math.max(...userTasks.map(t => t.current_streak || 0));
            const taskCount = userTasks.length;

            let title = '';
            let body = '';

            if (taskCount === 1) {
                const task = userTasks[0];
                title = `🔥 ¡Tu racha de ${task.current_streak} días está en peligro!`;
                body = `Si ${task.trigger_if} → ${task.action_then}`;
            } else {
                title = `🔥 ¡${taskCount} rachas en peligro!`;
                body = `Tu racha más larga: ${longestStreak} días. ¡No las pierdas!`;
            }

            const payload: NotificationPayload = {
                title,
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                tag: 'streak-reminder',
                data: {
                    url: '/dashboard',
                    type: 'streak_reminder',
                    taskCount,
                    longestStreak,
                },
                actions: [
                    { action: 'mark', title: '✅ Marcar hecho' },
                    { action: 'view', title: '📋 Ver rachas' },
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
            usersNotified: Object.keys(userStreaksAtRisk).length,
            sent: notificationsSent,
        });
    } catch (error: any) {
        console.error('Error in streak reminder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
