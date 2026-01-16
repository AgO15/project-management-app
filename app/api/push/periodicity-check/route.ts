// File: app/api/push/periodicity-check/route.ts
// Endpoint para verificar tareas con periodicidad y enviar notificaciones gamificadas

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification, NotificationPayload } from '@/lib/push-notifications';

// Días de la semana en español
const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Mensajes gamificados por hitos de streak
const STREAK_MESSAGES: Record<number, { emoji: string; message_es: string; message_en: string }> = {
    3: { emoji: '🌱', message_es: '¡3 días! El hábito está germinando', message_en: '3 days! The habit is sprouting' },
    7: { emoji: '🔥', message_es: '¡7 días! ¡Una semana completa!', message_en: '7 days! A full week!' },
    14: { emoji: '💪', message_es: '¡14 días! Estás en racha', message_en: '14 days! You\'re on fire' },
    21: { emoji: '🏆', message_es: '¡21 días! ¡Ya es un HÁBITO!', message_en: '21 days! It\'s a HABIT now!' },
    30: { emoji: '🎖️', message_es: '¡30 días! ¡Un mes completo!', message_en: '30 days! A full month!' },
    60: { emoji: '⭐', message_es: '¡60 días! ¡Impresionante!', message_en: '60 days! Impressive!' },
    90: { emoji: '👑', message_es: '¡90 días! ¡Eres imparable!', message_en: '90 days! You\'re unstoppable!' },
};

function getStreakMessage(streak: number): { emoji: string; message_es: string; message_en: string } | null {
    // Check for exact milestone
    if (STREAK_MESSAGES[streak]) {
        return STREAK_MESSAGES[streak];
    }
    // For non-milestone streaks, return motivational based on range
    if (streak >= 90) return { emoji: '👑', message_es: `¡${streak} días! ¡Legendario!`, message_en: `${streak} days! Legendary!` };
    if (streak >= 60) return { emoji: '⭐', message_es: `¡${streak} días seguidos!`, message_en: `${streak} days in a row!` };
    if (streak >= 30) return { emoji: '🎖️', message_es: `¡${streak} días! ¡Sigue así!`, message_en: `${streak} days! Keep it up!` };
    if (streak >= 21) return { emoji: '🏆', message_es: `¡${streak} días! ¡Hábito formado!`, message_en: `${streak} days! Habit formed!` };
    if (streak >= 7) return { emoji: '🔥', message_es: `¡Racha de ${streak} días!`, message_en: `${streak} day streak!` };
    if (streak >= 3) return { emoji: '🌱', message_es: `${streak} días seguidos`, message_en: `${streak} days in a row` };
    return null;
}

function shouldNotifyToday(periodicity: string, customDays?: string[]): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const dayName = DAYS_ES[dayOfWeek];

    switch (periodicity) {
        case 'daily':
            return true;
        case 'weekly':
            // Default to Monday for weekly
            return dayOfWeek === 1;
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
        // Create Supabase admin client inside function to avoid build-time errors
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const now = new Date();

        // Get all If-Then tasks with periodicity that are not completed
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
        current_streak,
        best_streak,
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

        // Group tasks by user that should be notified today
        const userNotifications: Record<string, typeof tasks> = {};

        for (const task of tasks) {
            const customDays = task.custom_days ? JSON.parse(task.custom_days) : [];

            if (shouldNotifyToday(task.periodicity, customDays)) {
                if (!userNotifications[task.user_id]) {
                    userNotifications[task.user_id] = [];
                }
                userNotifications[task.user_id].push(task);
            }
        }

        let notificationsSent = 0;

        // Send notifications to each user
        for (const [userId, userTasks] of Object.entries(userNotifications)) {
            // Get user's push subscriptions
            const { data: subscriptions } = await supabaseAdmin
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId);

            if (!subscriptions || subscriptions.length === 0) continue;

            // Send notification for each task
            for (const task of userTasks) {
                const streak = task.current_streak || 0;
                const streakInfo = getStreakMessage(streak);

                // Build notification
                let title = '⚡ ¡Es hora de tu intención!';
                let body = `Si ${task.trigger_if} → ${task.action_then}`;

                if (streakInfo && streak >= 3) {
                    title = `${streakInfo.emoji} ${streakInfo.message_es}`;
                    body = `Si ${task.trigger_if} → ${task.action_then}`;
                } else if (task.periodicity === 'daily') {
                    title = '☀️ Tu intención diaria';
                } else if (task.periodicity === 'weekly') {
                    title = '📅 Tu intención semanal';
                }

                const payload: NotificationPayload = {
                    title,
                    body,
                    icon: '/icons/icon-192x192.png',
                    tag: `intention-${task.id}`,
                    data: {
                        url: '/dashboard',
                        taskId: task.id,
                        type: 'periodicity_reminder',
                    },
                    actions: [
                        { action: 'complete', title: '✅ Completado' },
                        { action: 'snooze', title: '⏰ Más tarde' },
                    ],
                };

                // Send to all user's devices
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
        }

        return NextResponse.json({
            success: true,
            checked: tasks.length,
            usersNotified: Object.keys(userNotifications).length,
            sent: notificationsSent,
        });
    } catch (error: any) {
        console.error('Error in periodicity check:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
