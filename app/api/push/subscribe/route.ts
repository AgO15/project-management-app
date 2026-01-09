// File: app/api/push/subscribe/route.ts

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { subscription } = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Invalid subscription' },
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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check if subscription already exists
        const { data: existing } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint)
            .single();

        if (existing) {
            // Update existing subscription
            await supabase
                .from('push_subscriptions')
                .update({
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);
        } else {
            // Create new subscription
            await supabase
                .from('push_subscriptions')
                .insert({
                    user_id: user.id,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving subscription:', error);
        return NextResponse.json(
            { error: 'Failed to save subscription' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { endpoint } = await req.json();

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
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', endpoint);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting subscription:', error);
        return NextResponse.json(
            { error: 'Failed to delete subscription' },
            { status: 500 }
        );
    }
}
