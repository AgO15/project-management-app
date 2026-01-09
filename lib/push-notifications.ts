// File: lib/push-notifications.ts

import webpush from 'web-push';

// VAPID keys for push notifications
// These should be in environment variables in production
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@agnys.app';

// Configure web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

export async function sendPushNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
): Promise<boolean> {
    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        );
        return true;
    } catch (error: any) {
        console.error('Error sending push notification:', error);
        // If subscription is no longer valid, return false to mark for deletion
        if (error.statusCode === 410 || error.statusCode === 404) {
            return false;
        }
        throw error;
    }
}

export function getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
}
