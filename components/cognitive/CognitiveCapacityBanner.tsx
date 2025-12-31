"use client";

import { Cpu, Sparkles, TrendingUp, CheckCircle2, Pause, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProjectCycleState } from "@/lib/types";

// Capacity limits based on Cognitive Load Theory
export const CAPACITY_LIMITS = {
    introduction: 1,
    growth: 2,
    stabilization: Infinity,
    pause: Infinity,
};

interface Project {
    id: string;
    name: string;
    cycle_state?: ProjectCycleState | null;
}

interface CognitiveCapacityBannerProps {
    projects: Project[];
}

interface SlotIndicatorProps {
    label: string;
    icon: React.ReactNode;
    current: number;
    max: number;
    colorClass: string;
    bgColor: string;
}

function SlotIndicator({ label, icon, current, max, colorClass, bgColor }: SlotIndicatorProps) {
    const isAtLimit = current >= max;
    const isUnlimited = !isFinite(max);

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
            )}
            style={{
                backgroundColor: isAtLimit && !isUnlimited ? '#FEE2E2' : bgColor,
                boxShadow: isAtLimit && !isUnlimited
                    ? 'inset 3px 3px 6px rgba(220, 38, 38, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.5)'
                    : '5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.4)'
            }}
        >
            <span className={cn("flex-shrink-0", colorClass)}>
                {icon}
            </span>
            <div className="flex flex-col">
                <span className="text-xs font-medium text-[#888888]">{label}</span>
                <span className={cn(
                    "text-lg font-semibold",
                    isAtLimit && !isUnlimited ? "text-red-500" : "text-[#444444]"
                )}>
                    {current}/{isUnlimited ? "∞" : max}
                </span>
            </div>
            {isAtLimit && !isUnlimited && (
                <AlertTriangle className="w-4 h-4 text-red-500 ml-auto" />
            )}
        </div>
    );
}

export function CognitiveCapacityBanner({ projects }: CognitiveCapacityBannerProps) {
    const { t } = useLanguage();

    const counts = {
        introduction: projects.filter(p => p.cycle_state === "introduction").length,
        growth: projects.filter(p => p.cycle_state === "growth").length,
        stabilization: projects.filter(p => p.cycle_state === "stabilization").length,
        pause: projects.filter(p => p.cycle_state === "pause" || !p.cycle_state).length,
    };

    const activeFocusCount = counts.introduction + counts.growth;
    const activeFocusMax = CAPACITY_LIMITS.introduction + CAPACITY_LIMITS.growth;
    const isOverloaded = counts.introduction > CAPACITY_LIMITS.introduction || counts.growth > CAPACITY_LIMITS.growth;
    const cpuUsage = Math.min(100, Math.round((activeFocusCount / activeFocusMax) * 100));

    return (
        <div
            className={cn(
                "p-6 rounded-3xl transition-all bg-[#E0E5EC]",
                isOverloaded && "ring-2 ring-red-300"
            )}
            style={{
                boxShadow: '9px 9px 18px rgba(163, 177, 198, 0.6), -9px -9px 18px rgba(255, 255, 255, 0.5)'
            }}
        >
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{
                                background: isOverloaded
                                    ? 'linear-gradient(145deg, #F87171, #EF4444)'
                                    : 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <Cpu className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-base font-semibold text-[#444444]">
                                {t('cognitiveCapacity')}
                            </span>
                            <p className="text-sm text-[#888888]">
                                {t('mentalLoadManagement')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-32 h-3 rounded-full overflow-hidden bg-[#E0E5EC]"
                            style={{
                                boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${cpuUsage}%`,
                                    background: cpuUsage >= 100
                                        ? 'linear-gradient(90deg, #F87171, #EF4444)'
                                        : cpuUsage >= 66
                                            ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                                            : 'linear-gradient(90deg, #34D399, #10B981)'
                                }}
                            />
                        </div>
                        <span className={cn(
                            "text-sm font-semibold",
                            cpuUsage >= 100 ? "text-red-500" : cpuUsage >= 66 ? "text-amber-500" : "text-emerald-500"
                        )}>
                            {cpuUsage}%
                        </span>
                    </div>
                </div>

                {/* Slot Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <SlotIndicator
                        label={t('introduction')}
                        icon={<Sparkles className="w-5 h-5" />}
                        current={counts.introduction}
                        max={CAPACITY_LIMITS.introduction}
                        colorClass="text-purple-500"
                        bgColor="#F3E8FF"
                    />
                    <SlotIndicator
                        label={t('growth')}
                        icon={<TrendingUp className="w-5 h-5" />}
                        current={counts.growth}
                        max={CAPACITY_LIMITS.growth}
                        colorClass="text-emerald-500"
                        bgColor="#D1FAE5"
                    />
                    <SlotIndicator
                        label={t('stabilization')}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        current={counts.stabilization}
                        max={CAPACITY_LIMITS.stabilization}
                        colorClass="text-blue-500"
                        bgColor="#DBEAFE"
                    />
                    <SlotIndicator
                        label={t('pause')}
                        icon={<Pause className="w-5 h-5" />}
                        current={counts.pause}
                        max={CAPACITY_LIMITS.pause}
                        colorClass="text-gray-500"
                        bgColor="#F3F4F6"
                    />
                </div>

                {/* Overload warning */}
                {isOverloaded && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">
                            {t('capacityExceeded')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to check if a cycle state change is allowed
export function canChangeToCycleState(
    projects: Project[],
    currentProjectId: string,
    targetState: ProjectCycleState
): { allowed: boolean; message?: string } {
    if (targetState === "stabilization" || targetState === "pause") {
        return { allowed: true };
    }

    const countInTargetState = projects.filter(
        p => p.cycle_state === targetState && p.id !== currentProjectId
    ).length;

    const limit = CAPACITY_LIMITS[targetState];

    if (countInTargetState >= limit) {
        const stateName = targetState === "introduction" ? "Introducción" : "Crecimiento";
        return {
            allowed: false,
            message: `Capacidad Cognitiva al Límite. Ya tienes ${limit} proyecto(s) en ${stateName}. Para activar este proyecto, mueve uno actual a Estabilización o Pausa.`
        };
    }

    return { allowed: true };
}
