"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, Sparkles, TrendingUp, CheckCircle2, Pause, AlertTriangle, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    onClick: () => void;
    projects: Project[];
}

function SlotIndicator({ label, icon, current, max, colorClass, bgColor, onClick, projects }: SlotIndicatorProps) {
    const isAtLimit = current >= max;
    const isUnlimited = !isFinite(max);

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all w-full text-left",
                "hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
        </button>
    );
}

interface StagePopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stageLabel: string;
    stageIcon: React.ReactNode;
    stageColor: string;
    stageBgColor: string;
    projects: Project[];
}

function StagePopup({ open, onOpenChange, stageLabel, stageIcon, stageColor, stageBgColor, projects }: StagePopupProps) {
    const { language } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[95vw] max-w-md p-0 border-0 rounded-3xl overflow-hidden"
                style={{
                    backgroundColor: '#E0E5EC',
                    boxShadow: '20px 20px 40px rgba(163, 177, 198, 0.7), -20px -20px 40px rgba(255, 255, 255, 0.6)'
                }}
            >
                {/* Header */}
                <DialogHeader className="p-5 pb-3">
                    <DialogTitle className="flex items-center gap-3 text-lg">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                backgroundColor: stageBgColor,
                                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <span className={stageColor}>{stageIcon}</span>
                        </div>
                        <span className="text-[#444444]">{stageLabel}</span>
                        <span className="text-sm font-normal text-[#888888] ml-auto">
                            {projects.length} {language === 'es' ? 'proyecto(s)' : 'project(s)'}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                {/* Project List */}
                <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">
                    {projects.length === 0 ? (
                        <div
                            className="text-center py-8 rounded-2xl"
                            style={{
                                backgroundColor: '#F0F0F3',
                                boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            <p className="text-[#888888] text-sm">
                                {language === 'es' ? 'No hay proyectos en esta etapa' : 'No projects in this stage'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    onClick={() => onOpenChange(false)}
                                    className="flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] group"
                                    style={{
                                        backgroundColor: '#F0F0F3',
                                        boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.5)'
                                    }}
                                >
                                    <span className="text-[#444444] font-medium truncate pr-2">
                                        {project.name}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-[#7C9EBC] transition-colors flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function CognitiveCapacityBanner({ projects }: CognitiveCapacityBannerProps) {
    const { t } = useLanguage();
    const [selectedStage, setSelectedStage] = useState<ProjectCycleState | null>(null);

    const counts = {
        introduction: projects.filter(p => p.cycle_state === "introduction").length,
        growth: projects.filter(p => p.cycle_state === "growth").length,
        stabilization: projects.filter(p => p.cycle_state === "stabilization").length,
        pause: projects.filter(p => p.cycle_state === "pause" || !p.cycle_state).length,
    };

    const projectsByStage = {
        introduction: projects.filter(p => p.cycle_state === "introduction"),
        growth: projects.filter(p => p.cycle_state === "growth"),
        stabilization: projects.filter(p => p.cycle_state === "stabilization"),
        pause: projects.filter(p => p.cycle_state === "pause" || !p.cycle_state),
    };

    const stageConfig: Record<ProjectCycleState, { label: string; icon: React.ReactNode; colorClass: string; bgColor: string }> = {
        introduction: {
            label: t('introduction'),
            icon: <Sparkles className="w-5 h-5" />,
            colorClass: "text-purple-500",
            bgColor: "#F3E8FF"
        },
        growth: {
            label: t('growth'),
            icon: <TrendingUp className="w-5 h-5" />,
            colorClass: "text-emerald-500",
            bgColor: "#D1FAE5"
        },
        stabilization: {
            label: t('stabilization'),
            icon: <CheckCircle2 className="w-5 h-5" />,
            colorClass: "text-blue-500",
            bgColor: "#DBEAFE"
        },
        pause: {
            label: t('pause'),
            icon: <Pause className="w-5 h-5" />,
            colorClass: "text-gray-500",
            bgColor: "#F3F4F6"
        }
    };

    const activeFocusCount = counts.introduction + counts.growth;
    const activeFocusMax = CAPACITY_LIMITS.introduction + CAPACITY_LIMITS.growth;
    const isOverloaded = counts.introduction > CAPACITY_LIMITS.introduction || counts.growth > CAPACITY_LIMITS.growth;
    const cpuUsage = Math.min(100, Math.round((activeFocusCount / activeFocusMax) * 100));

    return (
        <>
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

                    {/* Slot Indicators - Now clickable */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(["introduction", "growth", "stabilization", "pause"] as ProjectCycleState[]).map((stage) => (
                            <SlotIndicator
                                key={stage}
                                label={stageConfig[stage].label}
                                icon={stageConfig[stage].icon}
                                current={counts[stage]}
                                max={CAPACITY_LIMITS[stage]}
                                colorClass={stageConfig[stage].colorClass}
                                bgColor={stageConfig[stage].bgColor}
                                onClick={() => setSelectedStage(stage)}
                                projects={projectsByStage[stage]}
                            />
                        ))}
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

            {/* Stage Popup Dialog */}
            {selectedStage && (
                <StagePopup
                    open={!!selectedStage}
                    onOpenChange={(open) => !open && setSelectedStage(null)}
                    stageLabel={stageConfig[selectedStage].label}
                    stageIcon={stageConfig[selectedStage].icon}
                    stageColor={stageConfig[selectedStage].colorClass}
                    stageBgColor={stageConfig[selectedStage].bgColor}
                    projects={projectsByStage[selectedStage]}
                />
            )}
        </>
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
