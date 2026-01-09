// Agnys Push Notification Service Worker
// This file should be placed in /public/sw-push.js

self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.body || '',
            icon: data.icon || '/icons/icon-192x192.png',
            badge: data.badge || '/icons/badge-72x72.png',
            tag: data.tag || 'agnys-notification',
            data: data.data || {},
            vibrate: [100, 50, 100],
            actions: data.actions || [
                { action: 'open', title: 'Abrir' },
                { action: 'dismiss', title: 'Cerrar' }
            ],
            requireInteraction: data.requireInteraction || false,
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Agnys', options)
        );
    } catch (error) {
        console.error('Error showing notification:', error);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};

    if (action === 'dismiss') {
        return;
    }

    // Default action: open the app
    const urlToOpen = data.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes('/dashboard') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

self.addEventListener('notificationclose', function (event) {
    // Analytics or cleanup if needed
    console.log('Notification closed:', event.notification.tag);
});
