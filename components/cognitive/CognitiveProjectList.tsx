"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    ArrowRight,
    Copy,
    Trash2,
    MoreVertical,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProjectCycleState } from "@/lib/types";

interface Project {
    id: string;
    name: string;
    description: string | null;
    color: string;
    status: string;
    cycle_state?: ProjectCycleState | null;
    representation?: string | null;
    area_id?: string | null;
    exit_criteria?: string | null;
    created_at: string;
    updated_at: string;
}

interface CognitiveProjectListProps {
    projects: Project[];
}

const LONG_PRESS_DURATION = 900; // 0.9 seconds

// Project Actions Hook
function useProjectActions(project: Project) {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();
    const { toast } = useToast();
    const { language } = useLanguage();

    const handlePressStart = useCallback((clientX: number, clientY: number) => {
        longPressTimer.current = setTimeout(() => {
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            setMenuPosition({ x: clientX, y: clientY });
            setShowContextMenu(true);
        }, LONG_PRESS_DURATION);
    }, []);

    const handlePressEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handleDuplicate = async () => {
        setIsDuplicating(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: newProject, error } = await supabase
                .from("projects")
                .insert({
                    name: `${project.name} (copia)`,
                    description: project.description,
                    color: project.color,
                    status: "not_started",
                    user_id: user.id,
                    area_id: project.area_id,
                    cycle_state: "introduction",
                    representation: project.representation,
                    exit_criteria: project.exit_criteria,
                })
                .select()
                .single();

            if (error) throw error;

            toast({
                title: language === 'es' ? "Proyecto duplicado" : "Project duplicated",
                description: language === 'es'
                    ? `"${newProject.name}" ha sido creado`
                    : `"${newProject.name}" has been created`,
            });

            setShowContextMenu(false);
            router.refresh();
        } catch (error) {
            console.error("Error duplicating project:", error);
            toast({
                title: language === 'es' ? "Error" : "Error",
                description: language === 'es'
                    ? "No se pudo duplicar el proyecto"
                    : "Could not duplicate project",
                variant: "destructive",
            });
        } finally {
            setIsDuplicating(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const supabase = createClient();

        try {
            await supabase.from("notes").delete().eq("project_id", project.id);
            await supabase.from("files").delete().eq("project_id", project.id);
            await supabase.from("tasks").delete().eq("project_id", project.id);
            await supabase.from("income_records").delete().eq("project_id", project.id);

            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", project.id);

            if (error) throw error;

            toast({
                title: language === 'es' ? "Proyecto eliminado" : "Project deleted",
                description: language === 'es'
                    ? `"${project.name}" ha sido eliminado`
                    : `"${project.name}" has been deleted`,
            });

            setShowDeleteDialog(false);
            setShowContextMenu(false);
            router.refresh();
        } catch (error) {
            console.error("Error deleting project:", error);
            toast({
                title: language === 'es' ? "Error" : "Error",
                description: language === 'es'
                    ? "No se pudo eliminar el proyecto"
                    : "Could not delete project",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        showContextMenu,
        setShowContextMenu,
        showDeleteDialog,
        setShowDeleteDialog,
        isDeleting,
        isDuplicating,
        menuPosition,
        handlePressStart,
        handlePressEnd,
        handleDuplicate,
        handleDelete,
        language,
    };
}

// Context Menu Component
function ProjectContextMenu({
    project,
    showContextMenu,
    setShowContextMenu,
    setShowDeleteDialog,
    menuPosition,
    isDuplicating,
    handleDuplicate,
    language
}: {
    project: Project;
    showContextMenu: boolean;
    setShowContextMenu: (v: boolean) => void;
    setShowDeleteDialog: (v: boolean) => void;
    menuPosition: { x: number; y: number };
    isDuplicating: boolean;
    handleDuplicate: () => void;
    language: string;
}) {
    if (!showContextMenu) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => setShowContextMenu(false)}
        >
            <div
                className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
                style={{
                    left: Math.min(menuPosition.x, typeof window !== 'undefined' ? window.innerWidth - 220 : 0),
                    top: Math.min(menuPosition.y, typeof window !== 'undefined' ? window.innerHeight - 150 : 0),
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 truncate">
                        {project.name}
                    </p>
                </div>
                <div className="p-1">
                    <button
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Copy className="h-4 w-4 text-blue-500" />
                        {isDuplicating
                            ? (language === 'es' ? 'Duplicando...' : 'Duplicating...')
                            : (language === 'es' ? 'Duplicar proyecto' : 'Duplicate project')
                        }
                    </button>
                    <button
                        onClick={() => {
                            setShowContextMenu(false);
                            setShowDeleteDialog(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        {language === 'es' ? 'Eliminar proyecto' : 'Delete project'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({
    project,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleDelete,
    language
}: {
    project: Project;
    showDeleteDialog: boolean;
    setShowDeleteDialog: (v: boolean) => void;
    isDeleting: boolean;
    handleDelete: () => void;
    language: string;
}) {
    return (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {language === 'es' ? 'Eliminar proyecto' : 'Delete project'}
                    </DialogTitle>
                    <DialogDescription>
                        {language === 'es'
                            ? `¿Estás seguro de que quieres eliminar "${project.name}"? Esta acción no se puede deshacer y se eliminarán todas las tareas, notas y archivos asociados.`
                            : `Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all associated tasks, notes, and files.`
                        }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={isDeleting}
                    >
                        {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting
                            ? (language === 'es' ? 'Eliminando...' : 'Deleting...')
                            : (language === 'es' ? 'Eliminar' : 'Delete')
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Project Card - Neumorphic style with long-press support
function ActiveFocusCard({ project }: { project: Project }) {
    const { t, language } = useLanguage();
    const actions = useProjectActions(project);

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
        <>
            <div
                className="flex flex-col h-full rounded-3xl bg-[#E0E5EC] transition-all hover:scale-[1.02] cursor-pointer select-none"
                style={{
                    boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)',
                    borderLeft: `4px solid ${project.color}`
                }}
                onMouseDown={(e) => actions.handlePressStart(e.clientX, e.clientY)}
                onMouseUp={actions.handlePressEnd}
                onMouseLeave={actions.handlePressEnd}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    actions.handlePressStart(touch.clientX, touch.clientY);
                }}
                onTouchEnd={actions.handlePressEnd}
                onContextMenu={(e) => {
                    e.preventDefault();
                    actions.setShowContextMenu(true);
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
                        <div className="flex items-center gap-2">
                            {cycleConfig && (
                                <span
                                    className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", cycleConfig.colorClass)}
                                    style={{ backgroundColor: cycleConfig.bgColor }}
                                >
                                    {cycleConfig.icon}
                                    {cycleLabel}
                                </span>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    actions.setShowContextMenu(true);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#D0D5DC] transition-colors"
                            >
                                <MoreVertical className="w-4 h-4 text-[#888]" />
                            </button>
                        </div>
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
                    <Link href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
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

            <ProjectContextMenu
                project={project}
                showContextMenu={actions.showContextMenu}
                setShowContextMenu={actions.setShowContextMenu}
                setShowDeleteDialog={actions.setShowDeleteDialog}
                menuPosition={actions.menuPosition}
                isDuplicating={actions.isDuplicating}
                handleDuplicate={actions.handleDuplicate}
                language={actions.language}
            />

            <DeleteConfirmDialog
                project={project}
                showDeleteDialog={actions.showDeleteDialog}
                setShowDeleteDialog={actions.setShowDeleteDialog}
                isDeleting={actions.isDeleting}
                handleDelete={actions.handleDelete}
                language={actions.language}
            />
        </>
    );
}

// Compact list item with long-press support
function CompactProjectItem({ project }: { project: Project }) {
    const { t } = useLanguage();
    const actions = useProjectActions(project);

    const cycleStateConfig: Record<ProjectCycleState, { icon: React.ReactNode; colorClass: string; bgColor: string }> = {
        introduction: { icon: <Sparkles className="w-4 h-4" />, colorClass: "text-purple-600", bgColor: "#F3E8FF" },
        growth: { icon: <TrendingUp className="w-4 h-4" />, colorClass: "text-emerald-600", bgColor: "#D1FAE5" },
        stabilization: { icon: <CheckCircle2 className="w-4 h-4" />, colorClass: "text-blue-600", bgColor: "#DBEAFE" },
        pause: { icon: <Pause className="w-4 h-4" />, colorClass: "text-gray-500", bgColor: "#F3F4F6" },
    };

    const cycleConfig = project.cycle_state ? cycleStateConfig[project.cycle_state] : null;

    return (
        <>
            <div
                className="flex items-center justify-between p-4 rounded-2xl bg-[#E0E5EC] hover:scale-[1.01] transition-all cursor-pointer select-none"
                style={{
                    boxShadow: '5px 5px 10px rgba(163, 177, 198, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.4)'
                }}
                onMouseDown={(e) => actions.handlePressStart(e.clientX, e.clientY)}
                onMouseUp={actions.handlePressEnd}
                onMouseLeave={actions.handlePressEnd}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    actions.handlePressStart(touch.clientX, touch.clientY);
                }}
                onTouchEnd={actions.handlePressEnd}
                onContextMenu={(e) => {
                    e.preventDefault();
                    actions.setShowContextMenu(true);
                }}
            >
                <Link href={`/projects/${project.id}`} className="flex items-center gap-3 flex-1" onClick={(e) => e.stopPropagation()}>
                    <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium text-[#444444] line-clamp-1">
                        {project.name}
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    {cycleConfig && (
                        <span
                            className={cn("flex items-center justify-center w-6 h-6 rounded-full", cycleConfig.colorClass)}
                            style={{ backgroundColor: cycleConfig.bgColor }}
                        >
                            {cycleConfig.icon}
                        </span>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            actions.setShowContextMenu(true);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#D0D5DC] transition-colors"
                    >
                        <MoreVertical className="w-4 h-4 text-[#888]" />
                    </button>
                </div>
            </div>

            <ProjectContextMenu
                project={project}
                showContextMenu={actions.showContextMenu}
                setShowContextMenu={actions.setShowContextMenu}
                setShowDeleteDialog={actions.setShowDeleteDialog}
                menuPosition={actions.menuPosition}
                isDuplicating={actions.isDuplicating}
                handleDuplicate={actions.handleDuplicate}
                language={actions.language}
            />

            <DeleteConfirmDialog
                project={project}
                showDeleteDialog={actions.showDeleteDialog}
                setShowDeleteDialog={actions.setShowDeleteDialog}
                isDeleting={actions.isDeleting}
                handleDelete={actions.handleDelete}
                language={actions.language}
            />
        </>
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
