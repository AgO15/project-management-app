"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProjectField } from "@/app/actions";
import { EditableText } from "@/components/EditableText";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sparkles, TrendingUp, CheckCircle2, Pause, Brain } from "lucide-react";
import type { ProjectCycleState } from "@/lib/types";

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  created_at: string;
  updated_at: string;
  // New cognitive fields
  cycle_state?: ProjectCycleState;
  representation?: string | null;
  exit_criteria?: string | null;
}

interface ProjectHeaderProps {
  project: Project;
}

// Cycle state configuration
const CYCLE_STATE_CONFIG: Record<ProjectCycleState, { icon: React.ReactNode; label: string; color: string }> = {
  introduction: {
    icon: <Sparkles className="w-3 h-3" />,
    label: "Introducción",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30"
  },
  growth: {
    icon: <TrendingUp className="w-3 h-3" />,
    label: "Crecimiento",
    color: "text-green-400 bg-green-500/10 border-green-500/30"
  },
  stabilization: {
    icon: <CheckCircle2 className="w-3 h-3" />,
    label: "Estabilización",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30"
  },
  pause: {
    icon: <Pause className="w-3 h-3" />,
    label: "Pausa",
    color: "text-gray-400 bg-gray-500/10 border-gray-500/30"
  },
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [currentStatus, setCurrentStatus] = useState(project.status);

  const handleSaveName = async (newName: string) => {
    const result = await updateProjectField(project.id, "name", newName);
    if (result.success) {
      toast.success("Project name updated.");
    } else {
      toast.error(result.error);
    }
  };

  const handleSaveDescription = async (newDescription: string) => {
    const result = await updateProjectField(project.id, "description", newDescription);
    if (result.success) {
      toast.success("Project description updated.");
    } else {
      toast.error(result.error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // No hacer nada si se deselecciona (newStatus es "") o si es el mismo
    if (!newStatus || newStatus === currentStatus) {
      return;
    }

    const oldStatus = currentStatus;
    setCurrentStatus(newStatus); // Update optimista

    toast.info("Updating project status...");

    const result = await updateProjectField(project.id, "status", newStatus);

    if (result.success) {
      toast.success("Status updated to: " + newStatus);
    } else {
      toast.error(result.error);
      setCurrentStatus(oldStatus); // Revertir si hay error
    }
  };

  const cycleConfig = project.cycle_state ? CYCLE_STATE_CONFIG[project.cycle_state] : null;

  return (
    <div className="px-3 sm:px-4 py-3 border-b border-border">
      <div className="flex justify-between items-start gap-3 sm:gap-4">
        <div className="flex items-start gap-2 sm:gap-4 flex-grow">
          <div className="flex-grow">
            {/* Title */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 mt-2 flex-shrink-0"
                style={{ backgroundColor: project.color, filter: 'saturate(1.5) brightness(1.2)' }}
              />
              <EditableText
                as="h1"
                initialValue={project.name}
                onSave={handleSaveName}
              />
            </div>

            {/* Cycle State Badge - NEW */}
            {cycleConfig && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cycleConfig.color}`}>
                  {cycleConfig.icon}
                  Ciclo: {cycleConfig.label}
                </span>
              </div>
            )}

            {/* "Semaphore" ToggleGroup */}
            <div className="mt-2">
              <ToggleGroup
                // 👇 ¡ESTA LÍNEA ES LA MÁS IMPORTANTE!
                type="single"
                value={currentStatus}
                onValueChange={handleStatusChange}
                className="flex gap-2 justify-start"
              >
                <ToggleGroupItem
                  value="active"
                  aria-label="Active"
                  variant="outline"
                  className="px-4 whitespace-nowrap data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  Active
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="paused"
                  aria-label="Paused"
                  variant="outline"
                  className="px-4 whitespace-nowrap data-[state=on]:bg-yellow-500 data-[state=on]:text-black hover:bg-yellow-500/80 hover:text-black"
                >
                  Paused
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="not_started"
                  aria-label="Not Started"
                  variant="outline"
                  className="px-4 whitespace-nowrap data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground"
                >
                  Not Started
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <EditableText
              as="textarea"
              initialValue={project.description || ""}
              onSave={handleSaveDescription}
            />

            {/* Representation - NEW (Cognitive Priming) */}
            {project.representation && (
              <div className="mt-3 p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-green-500/70 font-medium mb-1">Este proyecto representa:</p>
                    <p className="text-sm text-green-400 italic">"{project.representation}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Exit Criteria - NEW */}
            {project.exit_criteria && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">Criterio de salida:</span> {project.exit_criteria}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}