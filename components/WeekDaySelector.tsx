// File: components/WeekDaySelector.tsx
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface WeekDaySelectorProps {
    selectedDays: string[];
    onChange: (days: string[]) => void;
    disabled?: boolean;
}

const DAYS = [
    { key: 'lunes', es: 'L', en: 'M', full_es: 'Lunes', full_en: 'Monday' },
    { key: 'martes', es: 'M', en: 'T', full_es: 'Martes', full_en: 'Tuesday' },
    { key: 'miércoles', es: 'M', en: 'W', full_es: 'Miércoles', full_en: 'Wednesday' },
    { key: 'jueves', es: 'J', en: 'T', full_es: 'Jueves', full_en: 'Thursday' },
    { key: 'viernes', es: 'V', en: 'F', full_es: 'Viernes', full_en: 'Friday' },
    { key: 'sábado', es: 'S', en: 'S', full_es: 'Sábado', full_en: 'Saturday' },
    { key: 'domingo', es: 'D', en: 'S', full_es: 'Domingo', full_en: 'Sunday' },
];

export function WeekDaySelector({ selectedDays, onChange, disabled = false }: WeekDaySelectorProps) {
    const { language } = useLanguage();

    const toggleDay = (dayKey: string) => {
        if (disabled) return;

        const isSelected = selectedDays.includes(dayKey);
        if (isSelected) {
            onChange(selectedDays.filter(d => d !== dayKey));
        } else {
            onChange([...selectedDays, dayKey]);
        }
    };

    return (
        <div className="flex gap-1">
            {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.key);
                return (
                    <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        disabled={disabled}
                        title={language === 'es' ? day.full_es : day.full_en}
                        className={cn(
                            "w-7 h-7 rounded-lg text-xs font-medium transition-all",
                            disabled && "opacity-50 cursor-not-allowed",
                            isSelected
                                ? "text-white"
                                : "text-[#666666] hover:scale-105"
                        )}
                        style={isSelected ? {
                            background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                        } : {
                            backgroundColor: '#F0F0F3',
                            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        {language === 'es' ? day.es : day.en}
                    </button>
                );
            })}
        </div>
    );
}

// Helper to check if today matches selected days
export function isTodayInDays(customDays: string[]): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const dayMapping = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const todayName = dayMapping[dayOfWeek];
    return customDays.some(d => d.toLowerCase() === todayName.toLowerCase());
}

// Helper to check if a task should show today based on periodicity
export function shouldShowToday(periodicity: string | undefined, customDays?: string[]): boolean {
    if (!periodicity || periodicity === 'one_time') return true; // Always show one-time tasks

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    switch (periodicity) {
        case 'daily':
            return true;
        case 'weekly':
            return dayOfWeek === 1; // Monday
        case 'custom':
            if (!customDays || customDays.length === 0) return true;
            return isTodayInDays(customDays);
        default:
            return true;
    }
}
