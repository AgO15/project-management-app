// File: components/MobileChatDrawer.tsx
"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatComponent } from "@/components/chat-component";
import { useLanguage } from "@/contexts/LanguageContext";

export function MobileChatDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const { language } = useLanguage();

    return (
        <>
            {/* Floating Chat Button - Only visible on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
                style={{
                    background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                    boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.7), -6px -6px 12px rgba(255, 255, 255, 0.5)'
                }}
                aria-label={language === 'es' ? 'Abrir chat' : 'Open chat'}
            >
                <MessageCircle className="w-6 h-6" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer from bottom */}
            <div
                className={`sm:hidden fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
                style={{
                    maxHeight: '85vh',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    backgroundColor: '#E0E5EC',
                    boxShadow: '0 -10px 40px rgba(163, 177, 198, 0.6)'
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div
                        className="w-12 h-1.5 rounded-full bg-[#CCCCCC]"
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#888888] hover:text-[#444444] transition-colors"
                    style={{
                        backgroundColor: '#F0F0F3',
                        boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.5)'
                    }}
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Chat Component */}
                <div className="px-3 pb-6 pt-2 overflow-hidden" style={{ maxHeight: 'calc(85vh - 50px)' }}>
                    <ChatComponent />
                </div>
            </div>
        </>
    );
}
