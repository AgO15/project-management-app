// File: hooks/usePushNotifications.ts

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
    isSupported: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
    permission: NotificationPermission | null;
}

export function usePushNotifications() {
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        isSubscribed: false,
        isLoading: false,
        permission: null,
    });
    const { toast } = useToast();

    useEffect(() => {
        // Check if push notifications are supported
        const isSupported =
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window;

        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : null,
        }));

        if (isSupported) {
            checkSubscription();
        }
    }, []);

    const checkSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setState(prev => ({
                ...prev,
                isSubscribed: !!subscription,
            }));
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    }, []);

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!state.isSupported) {
            toast({
                title: "No soportado",
                description: "Tu navegador no soporta notificaciones push",
                variant: "destructive",
            });
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            setState(prev => ({ ...prev, permission }));

            if (permission !== 'granted') {
                toast({
                    title: "Permiso denegado",
                    description: "Necesitas permitir las notificaciones para recibirlas",
                    variant: "destructive",
                });
                return false;
            }

            // Get VAPID public key
            const vapidResponse = await fetch('/api/push/vapid-key');
            const { publicKey } = await vapidResponse.json();

            if (!publicKey) {
                throw new Error('VAPID key not available');
            }

            // Convert VAPID key to Uint8Array
            const urlBase64ToUint8Array = (base64String: string) => {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding)
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
            };

            // Subscribe to push
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            // Save subscription to server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: subscription.toJSON() }),
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription');
            }

            setState(prev => ({ ...prev, isSubscribed: true }));
            toast({
                title: "¡Notificaciones activadas!",
                description: "Recibirás recordatorios de tus tareas",
            });
            return true;
        } catch (error) {
            console.error('Error subscribing to push:', error);
            toast({
                title: "Error",
                description: "No se pudieron activar las notificaciones",
                variant: "destructive",
            });
            return false;
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [state.isSupported, toast]);

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe locally
                await subscription.unsubscribe();

                // Remove from server
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
            }

            setState(prev => ({ ...prev, isSubscribed: false }));
            toast({
                title: "Notificaciones desactivadas",
                description: "Ya no recibirás recordatorios",
            });
            return true;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast({
                title: "Error",
                description: "No se pudieron desactivar las notificaciones",
                variant: "destructive",
            });
            return false;
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [toast]);

    const toggleSubscription = useCallback(async () => {
        if (state.isSubscribed) {
            return unsubscribe();
        } else {
            return subscribe();
        }
    }, [state.isSubscribed, subscribe, unsubscribe]);

    return {
        ...state,
        subscribe,
        unsubscribe,
        toggleSubscription,
    };
}
