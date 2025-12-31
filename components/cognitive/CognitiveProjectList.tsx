"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    TrendingUp,
    CheckCircle2,
    Pause,
    Clock,
    ChevronDown,
    ChevronUp,
    Zap,
    Target,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProjectCycleState } from "@/lib/types";

interface Project {
    id: string;
    name: string;
    description: string | null;
    color: string;
    status: string;
    cycle_state?: ProjectCycleState | null;
    representation?: string | null;
    created_at: string;
    updated_at: string;
}

interface CognitiveProjectListProps {
    projects: Project[];
}

// Project Card - Neumorphic style
function ActiveFocusCard({ project }: { project: Project }) {
    const { t, language } = useLanguage();

    const cycleStateLabels: Record<ProjectCycleState, string> = {
        introduction: t('introduction'),
        growth: t('growth'),
        stabilization: t('stabilization'),
        pause: t('pause'),
    };

    const cycleStateConfig: Record<ProjectCycleState, { icon: React.ReactNode; colorClass: string; bgColor: string }> = {
        introduction: {
            icon: <Sparkles className="w-4 h-4" />,
            colorClass: "text-purple-600",
            bgColor: "#F3E8FF"
        },
        growth: {
            icon: <TrendingUp className="w-4 h-4" />,
            colorClass: "text-emerald-600",
            bgColor: "#D1FAE5"
        },
        stabilization: {
            icon: <CheckCircle2 className="w-4 h-4" />,
            colorClass: "text-blue-600",
            bgColor: "#DBEAFE"
        },
        pause: {
            icon: <Pause className="w-4 h-4" />,
            colorClass: "text-gray-500",
            bgColor: "#F3F4F6"
        },
    };

    const cycleConfig = project.cycle_state ? cycleStateConfig[project.cycle_state] : null;
    const cycleLabel = project.cycle_state ? cycleStateLabels[project.cycle_state] : null;
    const creationDate = new Date(project.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');

    return (
        <div
            className="flex flex-col h-full rounded-3xl bg-[#E0E5EC] transition-all hover:scale-[1.02]"
            style={{
                boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)',
                borderLeft: `4px solid ${project.color}`
            }}
        >
            <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: project.color, boxShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
                        />
                        <h3 className="text-base font-semibold text-[#444444] line-clamp-1">
                            {project.name}
                        </h3>
                    </div>
                    {cycleConfig && (
                        <span
                            className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", cycleConfig.colorClass)}
                            style={{ backgroundColor: cycleConfig.bgColor }}
                        >
                            {cycleConfig.icon}
                            {cycleLabel}
                        </span>
                    )}
                </div>

                {project.representation && (
                    <div
                        className="mb-3 p-3 rounded-xl"
                        style={{
                            backgroundColor: '#F0F0F3',
                            boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)'
                        }}
                    >
                        <p className="text-xs text-[#888888] italic flex items-start gap-2">
                            <Target className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#7C9EBC]" />
                            "{project.representation}"
                        </p>
                    </div>
                )}

                <p className="text-sm text-[#888888] line-clamp-2">
                    {project.description || <span>&nbsp;</span>}
                </p>
            </div>

            <div className="p-5 pt-0">
                <Link href={`/projects/${project.id}`}>
                    <Button
                        className="w-full rounded-2xl text-white font-medium border-0"
                        style={{
                            background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {t('openProject')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center text-xs text-[#888888] px-5 pb-4 border-t border-[rgba(163,177,198,0.3)] pt-3">
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {creationDate}
                </div>
            </div>
        </div>
    );
}

// Compact list item
function CompactProjectItem({ project }: { project: Project }) {
    const { t } = useLanguage();

    const cycleStateConfig: Record<ProjectCycleState, { icon: React.ReactNode; colorClass: string; bgColor: string }> = {
        introduction: { icon: <Sparkles className="w-4 h-4" />, colorClass: "text-purple-600", bgColor: "#F3E8FF" },
        growth: { icon: <TrendingUp className="w-4 h-4" />, colorClass: "text-emerald-600", bgColor: "#D1FAE5" },
        stabilization: { icon: <CheckCircle2 className="w-4 h-4" />, colorClass: "text-blue-600", bgColor: "#DBEAFE" },
        pause: { icon: <Pause className="w-4 h-4" />, colorClass: "text-gray-500", bgColor: "#F3F4F6" },
    };

    const cycleConfig = project.cycle_state ? cycleStateConfig[project.cycle_state] : null;

    return (
        <Link href={`/projects/${project.id}`}>
            <div
                className="flex items-center justify-between p-4 rounded-2xl bg-[#E0E5EC] hover:scale-[1.01] transition-all"
                style={{
                    boxShadow: '5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.4)'
                }}
            >
                <div className="flex items-center gap-3">
                    <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium text-[#444444] line-clamp-1">
                        {project.name}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {cycleConfig && (
                        <span
                            className={cn("flex items-center justify-center w-6 h-6 rounded-full", cycleConfig.colorClass)}
                            style={{ backgroundColor: cycleConfig.bgColor }}
                        >
                            {cycleConfig.icon}
                        </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-[#888888]" />
                </div>
            </div>
        </Link>
    );
}

// Section component
interface SectionProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    iconBg: string;
    projects: Project[];
    emptyMessage: string;
    isCollapsible?: boolean;
    isActiveFocus?: boolean;
}

function Section({ title, subtitle, icon, iconBg, projects, emptyMessage, isCollapsible = false, isActiveFocus = false }: SectionProps) {
    const [isExpanded, setIsExpanded] = useState(!isCollapsible);

    return (
        <div
            className="rounded-3xl bg-[#E0E5EC] overflow-hidden"
            style={{
                boxShadow: '9px 9px 18px rgba(163, 177, 198, 0.6), -9px -9px 18px rgba(255, 255, 255, 0.5)'
            }}
        >
            <div
                className={cn(
                    "flex items-center justify-between p-5",
                    isCollapsible && "cursor-pointer hover:bg-[#F0F0F3] transition-colors"
                )}
                onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                        style={{
                            background: iconBg,
                            boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[#444444]">
                            {title}
                            <span className="ml-2 text-sm text-[#888888] font-normal">
                                ({projects.length})
                            </span>
                        </h3>
                        <p className="text-xs text-[#888888]">{subtitle}</p>
                    </div>
                </div>
                {isCollapsible && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#888888]" /> : <ChevronDown className="w-4 h-4 text-[#888888]" />}
                    </Button>
                )}
            </div>

            {isExpanded && (
                <div className="p-5 pt-0">
                    {projects.length === 0 ? (
                        <div
                            className="text-center py-8 px-4 rounded-2xl"
                            style={{
                                backgroundColor: '#F0F0F3',
                                boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.7)'
                            }}
                        >
                            <p className="text-sm text-[#888888] italic">{emptyMessage}</p>
                        </div>
                    ) : isActiveFocus ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map(project => <ActiveFocusCard key={project.id} project={project} />)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {projects.map(project => <CompactProjectItem key={project.id} project={project} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function CognitiveProjectList({ projects }: CognitiveProjectListProps) {
    const { t } = useLanguage();

    const activeFocusProjects = projects.filter(p => p.cycle_state === "introduction" || p.cycle_state === "growth");
    const stabilizationProjects = projects.filter(p => p.cycle_state === "stabilization");
    const pausedProjects = projects.filter(p => p.cycle_state === "pause" || !p.cycle_state);

    if (projects.length === 0) {
        return (
            <div
                className="text-center py-16 px-6 rounded-3xl bg-[#E0E5EC]"
                style={{
                    boxShadow: '9px 9px 18px rgba(163, 177, 198, 0.6), -9px -9px 18px rgba(255, 255, 255, 0.5)'
                }}
            >
                <div
                    className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                    style={{
                        background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                        boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.4)'
                    }}
                >
                    <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#444444] mb-2">{t('noProjectsYet')}</h3>
                <p className="text-sm text-[#888888] mb-5">{t('createFirstProject')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Section
                title={t('activeFocus')}
                subtitle={t('projectsInIntroGrowth')}
                icon={<Zap className="w-5 h-5" />}
                iconBg="linear-gradient(145deg, #34D399, #10B981)"
                projects={activeFocusProjects}
                emptyMessage={t('capacityAvailable')}
                isActiveFocus={true}
            />

            <Section
                title={t('stabilization')}
                subtitle={t('habitsAndSystems')}
                icon={<CheckCircle2 className="w-5 h-5" />}
                iconBg="linear-gradient(145deg, #60A5FA, #3B82F6)"
                projects={stabilizationProjects}
                emptyMessage={t('noStabilizedHabits')}
                isCollapsible={true}
            />

            <Section
                title={t('inPause')}
                subtitle={t('temporarilyInactive')}
                icon={<Pause className="w-5 h-5" />}
                iconBg="linear-gradient(145deg, #9CA3AF, #6B7280)"
                projects={pausedProjects}
                emptyMessage={t('noPausedProjects')}
                isCollapsible={true}
            />
        </div>
    );
}
