// File: app/api/push/send/route.ts

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendPushNotification, NotificationPayload } from '@/lib/push-notifications';

export async function POST(req: Request) {
    try {
        const { userId, title, body, data } = await req.json();

        if (!userId || !title || !body) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
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

        // Get all subscriptions for the user
        const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json(
                { error: 'No subscriptions found', sent: 0 },
                { status: 200 }
            );
        }

        const payload: NotificationPayload = {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: data || {},
        };

        let successCount = 0;
        const invalidSubscriptions: string[] = [];

        for (const sub of subscriptions) {
            const subscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            const success = await sendPushNotification(subscription, payload);
            if (success) {
                successCount++;
            } else {
                invalidSubscriptions.push(sub.id);
            }
        }

        // Remove invalid subscriptions
        if (invalidSubscriptions.length > 0) {
            await supabase
                .from('push_subscriptions')
                .delete()
                .in('id', invalidSubscriptions);
        }

        return NextResponse.json({
            success: true,
            sent: successCount,
            removed: invalidSubscriptions.length,
        });
    } catch (error: any) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
