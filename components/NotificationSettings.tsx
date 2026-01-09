// File: components/NotificationSettings.tsx
"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLanguage } from "@/contexts/LanguageContext";

export function NotificationSettings() {
    const { language } = useLanguage();
    const {
        isSupported,
        isSubscribed,
        isLoading,
        permission,
        toggleSubscription,
    } = usePushNotifications();

    if (!isSupported) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#888888]"
                style={{
                    backgroundColor: '#E0E5EC',
                    boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                }}
            >
                <BellOff className="w-5 h-5" />
                <span>
                    {language === 'es'
                        ? 'Tu navegador no soporta notificaciones push'
                        : 'Your browser does not support push notifications'}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
            style={{
                backgroundColor: '#E0E5EC',
                boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.5)'
            }}
        >
            <div className="flex items-center gap-3">
                {isSubscribed ? (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(145deg, #34D399, #10B981)',
                            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F0F0F3]"
                        style={{
                            boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        <BellOff className="w-5 h-5 text-[#888888]" />
                    </div>
                )}
                <div>
                    <p className="font-medium text-[#444444]">
                        {language === 'es' ? 'Notificaciones Push' : 'Push Notifications'}
                    </p>
                    <p className="text-xs text-[#888888]">
                        {isSubscribed
                            ? (language === 'es' ? 'Recibirás recordatorios' : 'You will receive reminders')
                            : (language === 'es' ? 'Activa para recibir recordatorios' : 'Enable to receive reminders')}
                    </p>
                </div>
            </div>

            <Button
                onClick={toggleSubscription}
                disabled={isLoading}
                variant="outline"
                className={`rounded-xl border-0 ${isSubscribed ? 'text-red-500' : 'text-emerald-600'}`}
                style={{
                    backgroundColor: '#F0F0F3',
                    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)'
                }}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed ? (
                    language === 'es' ? 'Desactivar' : 'Disable'
                ) : (
                    language === 'es' ? 'Activar' : 'Enable'
                )}
            </Button>
        </div>
    );
}
