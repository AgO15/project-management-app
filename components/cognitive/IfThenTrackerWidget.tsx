"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, CheckCircle2, Pause, ChevronDown, ChevronRight, Zap, ArrowRight, RefreshCw, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { shouldShowToday } from "@/components/WeekDaySelector";
import type { ProjectCycleState, TaskPeriodicity } from "@/lib/types";

interface IfThenTask {
    id: string;
    trigger_if: string;
    action_then: string;
    project_id: string;
    periodicity?: TaskPeriodicity;
    custom_days?: string | string[]; // Can be JSON string from DB or parsed array
    projects: {
        id: string;
        name: string;
        cycle_state: ProjectCycleState | null;
    }[] | {
        id: string;
        name: string;
        cycle_state: ProjectCycleState | null;
    } | null;
}

// Helper to normalize project data (Supabase can return either array or object)
function getProject(task: IfThenTask): { id: string; name: string; cycle_state: ProjectCycleState | null } | null {
    if (!task.projects) return null;
    if (Array.isArray(task.projects)) return task.projects[0] || null;
    return task.projects;
}

interface IfThenTrackerWidgetProps {
    tasks: IfThenTask[];
}

interface StageGroupProps {
    stage: ProjectCycleState;
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    bgColor: string;
    tasks: IfThenTask[];
}

function StageGroup({ stage, label, icon, colorClass, bgColor, tasks }: StageGroupProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (tasks.length === 0) return null;

    return (
        <div className="mb-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-[#F0F0F3]"
            >
                <span className={colorClass}>{icon}</span>
                <span className="text-sm font-medium text-[#444444]">{label}</span>
                <span
                    className="text-xs px-2 py-0.5 rounded-full ml-1"
                    style={{ backgroundColor: bgColor }}
                >
                    {tasks.length}
                </span>
                <span className="ml-auto text-[#888888]">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-2 pl-2">
                    {tasks.map((task) => {
                        const project = getProject(task);
                        return (
                            <Link
                                key={task.id}
                                href={`/projects/${task.project_id}`}
                                className="block p-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] group"
                                style={{
                                    backgroundColor: '#F0F0F3',
                                    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <div className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#444444]">
                                            <span className="font-semibold text-purple-600">SI</span>{" "}
                                            <span className="text-[#555555]">{task.trigger_if}</span>
                                        </p>
                                        <p className="text-sm text-[#444444] mt-1">
                                            <span className="font-semibold text-emerald-600">→</span>{" "}
                                            <span className="text-[#555555]">{task.action_then}</span>
                                        </p>
                                        <p className="text-xs text-[#888888] mt-1.5 truncate flex items-center gap-2">
                                            <span>{project?.name}</span>
                                            {task.periodicity && task.periodicity !== 'one_time' && (
                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-medium">
                                                    <RefreshCw className="w-2.5 h-2.5" />
                                                    {task.periodicity === 'daily' ? 'Diario' : task.periodicity === 'weekly' ? 'Semanal' : 'Custom'}
                                                </span>
                                            )}
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function IfThenTrackerWidget({ tasks }: IfThenTrackerWidgetProps) {
    const { t, language } = useLanguage();
    const [showOnlyToday, setShowOnlyToday] = useState(true);

    // Filter tasks by today if filter is enabled
    const filteredTasks = showOnlyToday
        ? tasks.filter(task => {
            // Exclude tasks without periodicity or with one_time periodicity
            if (!task.periodicity || task.periodicity === 'one_time') {
                return false;
            }

            // Parse custom_days if it's a JSON string
            let parsedDays: string[] | undefined;
            if (task.custom_days) {
                if (typeof task.custom_days === 'string') {
                    try {
                        parsedDays = JSON.parse(task.custom_days);
                    } catch {
                        parsedDays = [];
                    }
                } else {
                    parsedDays = task.custom_days;
                }
            }
            return shouldShowToday(task.periodicity, parsedDays);
        })
        : tasks.filter(task => {
            // Even when showing all, exclude tasks without periodicity or with one_time
            return task.periodicity && task.periodicity !== 'one_time';
        });

    // Group tasks by project cycle_state
    const tasksByStage: Record<ProjectCycleState, IfThenTask[]> = {
        introduction: [],
        growth: [],
        stabilization: [],
        pause: [],
    };

    filteredTasks.forEach((task) => {
        const project = getProject(task);
        const stage = project?.cycle_state || 'pause';
        tasksByStage[stage].push(task);
    });

    const stageConfig: Record<ProjectCycleState, { label: string; icon: React.ReactNode; colorClass: string; bgColor: string }> = {
        introduction: {
            label: t('introduction'),
            icon: <Sparkles className="w-4 h-4" />,
            colorClass: "text-purple-500",
            bgColor: "#F3E8FF"
        },
        growth: {
            label: t('growth'),
            icon: <TrendingUp className="w-4 h-4" />,
            colorClass: "text-emerald-500",
            bgColor: "#D1FAE5"
        },
        stabilization: {
            label: t('stabilization'),
            icon: <CheckCircle2 className="w-4 h-4" />,
            colorClass: "text-blue-500",
            bgColor: "#DBEAFE"
        },
        pause: {
            label: t('pause'),
            icon: <Pause className="w-4 h-4" />,
            colorClass: "text-gray-500",
            bgColor: "#F3F4F6"
        }
    };

    const totalTasks = filteredTasks.length;
    const allTasksCount = tasks.length;

    // Get today's date formatted
    const today = new Date();
    const dayNames = language === 'es'
        ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];

    return (
        <div
            className="p-5 rounded-3xl bg-[#E0E5EC]"
            style={{
                boxShadow: '9px 9px 18px rgba(163, 177, 198, 0.6), -9px -9px 18px rgba(255, 255, 255, 0.5)'
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(145deg, #A78BFA, #7C9EBC)',
                        boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                    }}
                >
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-[#444444]">{t('ifThenTracker')}</h3>
                    <p className="text-xs text-[#888888]">
                        {showOnlyToday
                            ? `${todayName} • ${totalTasks} ${language === 'es' ? 'para hoy' : 'for today'}`
                            : t('ifThenTrackerSubtitle')
                        }
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={() => setShowOnlyToday(!showOnlyToday)}
                        className={cn(
                            "px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                            showOnlyToday ? "text-purple-600" : "text-[#888888]"
                        )}
                        style={{
                            backgroundColor: showOnlyToday ? '#F3E8FF' : '#F0F0F3',
                            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        <Calendar className="w-3 h-3" />
                        {showOnlyToday
                            ? (language === 'es' ? 'Hoy' : 'Today')
                            : (language === 'es' ? 'Todas' : 'All')}
                    </button>
                    {allTasksCount > 0 && (
                        <span className="text-sm font-medium text-[#888888]">
                            {totalTasks}/{allTasksCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Content - Scrollable */}
            <div
                className="max-h-[300px] overflow-y-auto pr-1"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#C4C9D4 transparent'
                }}
            >
                {totalTasks === 0 ? (
                    <div
                        className="text-center py-8 rounded-2xl"
                        style={{
                            backgroundColor: '#F0F0F3',
                            boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        <Zap className="w-8 h-8 text-[#C4C9D4] mx-auto mb-2" />
                        <p className="text-sm text-[#888888]">{t('noIfThenTasks')}</p>
                    </div>
                ) : (
                    <div>
                        {(["introduction", "growth", "stabilization", "pause"] as ProjectCycleState[]).map((stage) => (
                            <StageGroup
                                key={stage}
                                stage={stage}
                                label={stageConfig[stage].label}
                                icon={stageConfig[stage].icon}
                                colorClass={stageConfig[stage].colorClass}
                                bgColor={stageConfig[stage].bgColor}
                                tasks={tasksByStage[stage]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
