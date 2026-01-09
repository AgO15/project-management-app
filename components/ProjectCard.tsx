"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Project, ProjectCycleState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Sparkles, TrendingUp, CheckCircle2, Pause, Copy, Trash2, MoreVertical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProjectCardProps {
  project: Project;
}

// Definimos los estilos según el estatus para que coincidan con el Header
const statusStyles: Record<string, string> = {
  active: "bg-primary/20 text-primary border-primary/30", // Verde Neón
  paused: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", // Amarillo
  not_started: "bg-destructive/20 text-destructive border-destructive/30", // Rojo
  completed: "bg-blue-500/20 text-blue-500 border-blue-500/30", // Azul
  archived: "bg-muted text-muted-foreground border-border", // Gris
};

// Cycle state configuration
const cycleStateConfig: Record<ProjectCycleState, { icon: React.ReactNode; label: string; colorClass: string }> = {
  introduction: {
    icon: <Sparkles className="w-3 h-3" />,
    label: "Intro",
    colorClass: "text-purple-400"
  },
  growth: {
    icon: <TrendingUp className="w-3 h-3" />,
    label: "Growth",
    colorClass: "text-green-400"
  },
  stabilization: {
    icon: <CheckCircle2 className="w-3 h-3" />,
    label: "Stable",
    colorClass: "text-blue-400"
  },
  pause: {
    icon: <Pause className="w-3 h-3" />,
    label: "Pause",
    colorClass: "text-gray-400"
  },
};

const LONG_PRESS_DURATION = 900; // 0.9 seconds

export function ProjectCard({ project }: ProjectCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();

  const creationDate = new Date(project.created_at).toLocaleDateString();

  // Obtenemos el estilo correspondiente, o usamos gris por defecto
  const statusClass = statusStyles[project.status] || statusStyles.archived;

  // Formateamos el texto (ej: "not_started" -> "Not Started")
  const statusLabel = project.status.replace(/_/g, " ");

  // Get cycle state config
  const cycleConfig = project.cycle_state ? cycleStateConfig[project.cycle_state] : null;

  // Long press handlers
  const handlePressStart = useCallback((clientX: number, clientY: number) => {
    longPressTimer.current = setTimeout(() => {
      // Haptic feedback if available
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

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handlePressStart(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handlePressEnd();
  };

  const handleMouseLeave = () => {
    handlePressEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handlePressStart(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handlePressEnd();
  };

  // Duplicate project
  const handleDuplicate = async () => {
    setIsDuplicating(true);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create duplicated project
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

  // Delete project
  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    try {
      // Delete related data first (tasks, notes, files, time entries)
      await supabase.from("time_entries").delete().eq("task_id",
        supabase.from("tasks").select("id").eq("project_id", project.id)
      );
      await supabase.from("notes").delete().eq("project_id", project.id);
      await supabase.from("files").delete().eq("project_id", project.id);
      await supabase.from("tasks").delete().eq("project_id", project.id);
      await supabase.from("income_records").delete().eq("project_id", project.id);

      // Delete the project
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

  return (
    <>
      <Card
        ref={cardRef}
        className="flex flex-col justify-between h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuPosition({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
        }}
      >
        <div className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* El punto de color también respeta el color del proyecto si existe */}
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#ccc' }} />
                <CardTitle className="line-clamp-1">{project.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {/* Cycle State Icon */}
                {cycleConfig && (
                  <span className={cn("flex items-center gap-1 text-xs", cycleConfig.colorClass)} title={`Ciclo: ${cycleConfig.label}`}>
                    {cycleConfig.icon}
                  </span>
                )}
                {/* Quick access menu button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                      <Copy className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Duplicar proyecto' : 'Duplicate project'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Eliminar proyecto' : 'Delete project'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardDescription className="pt-2 line-clamp-3">
              {project.description || <span>&nbsp;</span>}
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-auto pt-4">
            <Link href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary">
                Open Project
              </Button>
            </Link>
          </CardContent>
        </div>

        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t border-border/50">
          {/* Status badge */}
          <span className={cn("text-xs px-2.5 py-1 rounded-md capitalize border font-medium transition-colors", statusClass)}>
            {statusLabel}
          </span>

          <div className="flex items-center gap-2 text-xs opacity-70">
            <Clock className="h-3 w-3" />
            <span>
              {creationDate}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Long-press context menu overlay */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/20"
          onClick={() => setShowContextMenu(false)}
        >
          <div
            className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
            style={{
              left: Math.min(menuPosition.x, window.innerWidth - 220),
              top: Math.min(menuPosition.y, window.innerHeight - 150),
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
      )}

      {/* Delete confirmation dialog */}
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
    </>
  );
}

