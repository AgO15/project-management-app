"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Flame, Star, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HabitMark {
    id: string;
    marked_date: string;
    created_at: string;
}

interface HabitTrackerProps {
    taskId: string;
    marks: HabitMark[];
}

// Neumorphic styles
const neuInsetStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)',
};

const neuButtonStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.5)',
};

const HABIT_GOAL = 21;

export function HabitTracker({ taskId, marks }: HabitTrackerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();

    const totalDays = marks.length;
    const progressPercent = Math.min((totalDays / HABIT_GOAL) * 100, 100);
    const isCompleted = totalDays >= HABIT_GOAL;

    // Calculate current streak
    const currentStreak = useMemo(() => {
        if (marks.length === 0) return 0;

        const sortedDates = marks
            .map(m => new Date(m.marked_date))
            .sort((a, b) => b.getTime() - a.getTime());

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            expectedDate.setHours(0, 0, 0, 0);

            const markDate = new Date(sortedDates[i]);
            markDate.setHours(0, 0, 0, 0);

            if (markDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else if (i === 0 && markDate.getTime() === expectedDate.getTime() - 86400000) {
                // Allow yesterday as start of streak
                continue;
            } else {
                break;
            }
        }

        return streak;
    }, [marks]);

    // Get motivational message based on progress
    const getMotivationalMessage = () => {
        if (totalDays >= 21) return t('habitFormed');
        if (totalDays >= 15) return t('habitAlmostThere');
        if (totalDays >= 8) return t('habitHalfway');
        if (totalDays >= 1) return t('habitGoodStart');
        return "";
    };

    // Get fire level emoji based on streak
    const getFireEmoji = () => {
        if (isCompleted) return "⭐";
        if (currentStreak >= 14) return "🔥🔥🔥";
        if (currentStreak >= 7) return "🔥🔥";
        if (currentStreak >= 1) return "🔥";
        return "○";
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
    };

    const monthName = currentMonth.toLocaleDateString(t('habitTracker') === 'Racha de Hábito' ? 'es' : 'en', {
        month: 'long',
        year: 'numeric'
    });

    const markedDatesSet = useMemo(() => {
        return new Set(marks.map(m => m.marked_date));
    }, [marks]);

    const isDateMarked = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return markedDatesSet.has(dateStr);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isFutureDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    const toggleDay = async (date: Date) => {
        if (isFutureDate(date)) return;

        setLoading(true);
        const supabase = createClient();
        const dateStr = date.toISOString().split('T')[0];

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            if (isDateMarked(date)) {
                // Remove mark
                const { error } = await supabase
                    .from("habit_day_marks")
                    .delete()
                    .eq("task_id", taskId)
                    .eq("marked_date", dateStr);

                if (error) throw error;
            } else {
                // Add mark
                const { error } = await supabase
                    .from("habit_day_marks")
                    .insert({
                        task_id: taskId,
                        user_id: user.id,
                        marked_date: dateStr,
                    });

                if (error) throw error;
            }

            router.refresh();
        } catch (error: any) {
            console.error("Error toggling habit mark:", error);
            toast({
                title: t('error'),
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
        }

        return days;
    }, [currentMonth]);

    const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                >
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-[#7C9EBC]" />
                    ) : (
                        <ChevronRightIcon className="h-4 w-4 text-[#7C9EBC]" />
                    )}
                    <span className="text-lg">{getFireEmoji()}</span>
                    <span className="text-sm text-[#666]">{t('habitTracker')}</span>
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-xs px-2 py-0.5 rounded-lg",
                            isCompleted
                                ? "bg-amber-100 text-amber-700"
                                : "bg-[#E0E5EC] text-[#666]"
                        )}
                        style={!isCompleted ? neuInsetStyle : undefined}
                    >
                        {totalDays}/{HABIT_GOAL}
                    </Badge>
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3">
                <div className="space-y-3 pl-6">
                    {/* Progress bar - only show when there's progress */}
                    {totalDays > 0 && (
                        <div
                            className="h-3 rounded-full overflow-hidden"
                            style={neuInsetStyle}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${progressPercent}%`,
                                    background: isCompleted
                                        ? 'linear-gradient(145deg, #F59E0B, #FBBF24)'
                                        : 'linear-gradient(145deg, #F97316, #FB923C)'
                                }}
                            />
                        </div>
                    )}

                    {/* Motivational message */}
                    {totalDays > 0 && (
                        <p className="text-sm font-medium text-center" style={{ color: isCompleted ? '#F59E0B' : '#F97316' }}>
                            {getMotivationalMessage()}
                        </p>
                    )}

                    {/* Current streak */}
                    {currentStreak > 0 && (
                        <div className="text-center text-sm text-[#666]">
                            {t('currentStreak')}: <span className="font-bold text-orange-500">{currentStreak} {currentStreak === 1 ? 'día' : 'días'}</span>
                        </div>
                    )}

                    {/* Calendar Popup */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center gap-2 text-[#7C9EBC] hover:text-[#5A7C9A] hover:bg-[#F0F0F3] rounded-xl px-3 py-2"
                                style={neuButtonStyle}
                            >
                                📅 {t('markToday')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-80 p-4 rounded-2xl border-0"
                            style={{
                                backgroundColor: '#E0E5EC',
                                boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            {/* Month navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={prevMonth}
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-[#F0F0F3]"
                                >
                                    <ChevronLeft className="h-4 w-4 text-[#666]" />
                                </Button>
                                <span className="font-medium text-[#444] capitalize">{monthName}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={nextMonth}
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-[#F0F0F3]"
                                >
                                    <ChevronRight className="h-4 w-4 text-[#666]" />
                                </Button>
                            </div>

                            {/* Week days header */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {weekDays.map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-[#888] py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((date, index) => (
                                    <div key={index} className="aspect-square">
                                        {date && (
                                            <button
                                                onClick={() => toggleDay(date)}
                                                disabled={loading || isFutureDate(date)}
                                                className={cn(
                                                    "w-full h-full rounded-lg text-sm font-medium transition-all",
                                                    "flex items-center justify-center",
                                                    isFutureDate(date) && "opacity-30 cursor-not-allowed",
                                                    isToday(date) && !isDateMarked(date) && "ring-2 ring-orange-400 ring-offset-1",
                                                    isDateMarked(date)
                                                        ? "text-white"
                                                        : "text-[#666] hover:bg-[#F0F0F3]"
                                                )}
                                                style={isDateMarked(date) ? {
                                                    background: 'linear-gradient(145deg, #34D399, #10B981)',
                                                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.3)'
                                                } : undefined}
                                            >
                                                {isDateMarked(date) ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    date.getDate()
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Summary in popup */}
                            <div className="mt-4 pt-3 border-t border-[rgba(163,177,198,0.3)]">
                                <div className="flex justify-between text-sm text-[#666]">
                                    <span>{t('totalDays')}:</span>
                                    <span className="font-bold text-emerald-600">{totalDays}</span>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
