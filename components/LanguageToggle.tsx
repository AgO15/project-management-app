"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
    className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
    const { language, toggleLanguage } = useLanguage();
    const isEnglish = language === 'en';

    return (
        <button
            onClick={toggleLanguage}
            className={cn(
                "relative flex items-center w-16 h-8 rounded-full cursor-pointer transition-all duration-300",
                className
            )}
            style={{
                backgroundColor: '#E0E5EC',
                boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.6), inset -4px -4px 8px rgba(255, 255, 255, 0.5)'
            }}
            aria-label={`Switch to ${isEnglish ? 'Spanish' : 'English'}`}
        >
            {/* Track labels */}
            <span
                className={cn(
                    "absolute left-2 text-[10px] font-semibold transition-opacity duration-300",
                    isEnglish ? "opacity-40" : "opacity-0"
                )}
                style={{ color: '#888888' }}
            >
                ES
            </span>
            <span
                className={cn(
                    "absolute right-2 text-[10px] font-semibold transition-opacity duration-300",
                    !isEnglish ? "opacity-40" : "opacity-0"
                )}
                style={{ color: '#888888' }}
            >
                EN
            </span>

            {/* Knob - Neumorphic 3D ball */}
            <div
                className={cn(
                    "absolute w-6 h-6 rounded-full transition-all duration-300 ease-out",
                    isEnglish ? "translate-x-9" : "translate-x-1"
                )}
                style={{
                    background: 'linear-gradient(145deg, #ffffff, #d1d5dc)',
                    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.7), -2px -2px 5px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.5)'
                }}
            >
                {/* Inner highlight for 3D effect */}
                <div
                    className="absolute top-1 left-1 w-2 h-2 rounded-full"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), transparent)'
                    }}
                />
            </div>

            {/* Active language indicator */}
            <span
                className={cn(
                    "absolute text-[10px] font-bold transition-all duration-300",
                    isEnglish ? "right-2 opacity-100" : "left-2 opacity-100"
                )}
                style={{ color: '#7C9EBC' }}
            >
                {isEnglish ? "EN" : "ES"}
            </span>
        </button>
    );
}

// Larger version with label
export function LanguageToggleWithLabel({ className }: LanguageToggleProps) {
    const { language, toggleLanguage, t } = useLanguage();
    const isEnglish = language === 'en';

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <span className="text-sm text-[#888888]">{t('language')}:</span>

            <button
                onClick={toggleLanguage}
                className="relative flex items-center w-20 h-10 rounded-full cursor-pointer transition-all duration-300"
                style={{
                    backgroundColor: '#E0E5EC',
                    boxShadow: 'inset 5px 5px 10px rgba(163, 177, 198, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0.5)'
                }}
                aria-label={`Switch to ${isEnglish ? 'Spanish' : 'English'}`}
            >
                {/* Track labels */}
                <span
                    className={cn(
                        "absolute left-2.5 text-xs font-medium transition-opacity duration-300",
                        isEnglish ? "opacity-30" : "opacity-0"
                    )}
                    style={{ color: '#888888' }}
                >
                    ES
                </span>
                <span
                    className={cn(
                        "absolute right-2.5 text-xs font-medium transition-opacity duration-300",
                        !isEnglish ? "opacity-30" : "opacity-0"
                    )}
                    style={{ color: '#888888' }}
                >
                    EN
                </span>

                {/* Knob - Neumorphic 3D sphere */}
                <div
                    className={cn(
                        "absolute w-8 h-8 rounded-full transition-all duration-300 ease-out flex items-center justify-center",
                        isEnglish ? "translate-x-11" : "translate-x-1"
                    )}
                    style={{
                        background: 'linear-gradient(145deg, #ffffff, #d1d5dc)',
                        boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.7), -3px -3px 6px rgba(255, 255, 255, 0.9), inset 1px 1px 3px rgba(255, 255, 255, 0.5)'
                    }}
                >
                    {/* Inner highlight */}
                    <div
                        className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), transparent)'
                        }}
                    />
                    {/* Language code on knob */}
                    <span className="text-[10px] font-bold text-[#7C9EBC] relative z-10">
                        {isEnglish ? "EN" : "ES"}
                    </span>
                </div>
            </button>
        </div>
    );
}
