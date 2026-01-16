// File: app/api/intentions/complete/route.ts
// Endpoint para marcar una intención Si-Entonces como completada hoy y actualizar streak

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { taskId } = await req.json();

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get task details
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .select('id, title, trigger_if, action_then, current_streak, best_streak')
            .eq('id', taskId)
            .eq('user_id', user.id)
            .single();

        if (taskError || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Check if already completed today
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabase
            .from('intention_completions')
            .select('id')
            .eq('task_id', taskId)
            .eq('completed_at', today)
            .single();

        if (existing) {
            return NextResponse.json({
                success: true,
                alreadyCompleted: true,
                message: 'Already completed today',
                streak: task.current_streak
            });
        }

        // Insert completion (trigger will update streak)
        const { error: insertError } = await supabase
            .from('intention_completions')
            .insert({
                task_id: taskId,
                user_id: user.id,
                completed_at: today,
            });

        if (insertError) {
            console.error('Error inserting completion:', insertError);
            return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
        }

        // Get updated streak
        const { data: updatedTask } = await supabase
            .from('tasks')
            .select('current_streak, best_streak')
            .eq('id', taskId)
            .single();

        const newStreak = updatedTask?.current_streak || 1;
        const isNewBest = newStreak === updatedTask?.best_streak && newStreak > (task.best_streak || 0);

        // Determine milestone
        const milestones = [3, 7, 14, 21, 30, 60, 90];
        const isMilestone = milestones.includes(newStreak);

        // Generate gamified response
        let celebrationEmoji = '✅';
        let message = 'Intención completada';

        if (newStreak >= 90) {
            celebrationEmoji = '👑';
            message = `¡${newStreak} días! ¡Eres imparable!`;
        } else if (newStreak >= 60) {
            celebrationEmoji = '⭐';
            message = `¡${newStreak} días! ¡Impresionante!`;
        } else if (newStreak >= 30) {
            celebrationEmoji = '🎖️';
            message = `¡${newStreak} días! ¡Un mes de constancia!`;
        } else if (newStreak >= 21) {
            celebrationEmoji = '🏆';
            message = `¡${newStreak} días! ¡Es un hábito!`;
        } else if (newStreak >= 14) {
            celebrationEmoji = '💪';
            message = `¡${newStreak} días! ¡Estás en racha!`;
        } else if (newStreak >= 7) {
            celebrationEmoji = '🔥';
            message = `¡${newStreak} días! ¡Una semana!`;
        } else if (newStreak >= 3) {
            celebrationEmoji = '🌱';
            message = `¡${newStreak} días! ¡El hábito germina!`;
        } else if (newStreak >= 1) {
            celebrationEmoji = '✨';
            message = `¡Día ${newStreak}! ¡Buen comienzo!`;
        }

        return NextResponse.json({
            success: true,
            alreadyCompleted: false,
            streak: newStreak,
            bestStreak: updatedTask?.best_streak || newStreak,
            isNewBest,
            isMilestone,
            celebrationEmoji,
            message,
        });
    } catch (error: any) {
        console.error('Error completing intention:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET endpoint to check if completed today
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const taskId = url.searchParams.get('taskId');

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0];

        const { data: completion } = await supabase
            .from('intention_completions')
            .select('id, completed_at')
            .eq('task_id', taskId)
            .eq('completed_at', today)
            .single();

        const { data: task } = await supabase
            .from('tasks')
            .select('current_streak, best_streak')
            .eq('id', taskId)
            .single();

        return NextResponse.json({
            completedToday: !!completion,
            streak: task?.current_streak || 0,
            bestStreak: task?.best_streak || 0,
        });
    } catch (error: any) {
        console.error('Error checking completion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
