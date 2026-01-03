"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProjectField } from "@/app/actions";
import { EditableText } from "@/components/EditableText";
import { useLanguage } from "@/contexts/LanguageContext";
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
  cycle_state?: ProjectCycleState;
  representation?: string | null;
  exit_criteria?: string | null;
}

interface ProjectHeaderProps {
  project: Project;
}

// Cycle state configuration with neumorphic colors
const CYCLE_STATE_CONFIG: Record<ProjectCycleState, { icon: React.ReactNode; labelEs: string; labelEn: string; bgColor: string; textColor: string }> = {
  introduction: {
    icon: <Sparkles className="w-3 h-3" />,
    labelEs: "Introducción",
    labelEn: "Introduction",
    bgColor: "linear-gradient(145deg, #A78BFA, #8B5CF6)",
    textColor: "text-white"
  },
  growth: {
    icon: <TrendingUp className="w-3 h-3" />,
    labelEs: "Crecimiento",
    labelEn: "Growth",
    bgColor: "linear-gradient(145deg, #34D399, #10B981)",
    textColor: "text-white"
  },
  stabilization: {
    icon: <CheckCircle2 className="w-3 h-3" />,
    labelEs: "Estabilización",
    labelEn: "Stabilization",
    bgColor: "linear-gradient(145deg, #7C9EBC, #6B8DAB)",
    textColor: "text-white"
  },
  pause: {
    icon: <Pause className="w-3 h-3" />,
    labelEs: "Pausa",
    labelEn: "Pause",
    bgColor: "linear-gradient(145deg, #9CA3AF, #6B7280)",
    textColor: "text-white"
  },
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { language } = useLanguage();
  const [currentStatus, setCurrentStatus] = useState(project.status);

  const handleSaveName = async (newName: string) => {
    const result = await updateProjectField(project.id, "name", newName);
    if (result.success) {
      toast.success(language === 'es' ? "Nombre actualizado" : "Name updated");
    } else {
      toast.error(result.error);
    }
  };

  const handleSaveDescription = async (newDescription: string) => {
    const result = await updateProjectField(project.id, "description", newDescription);
    if (result.success) {
      toast.success(language === 'es' ? "Descripción actualizada" : "Description updated");
    } else {
      toast.error(result.error);
    }
  };

  const cycleConfig = project.cycle_state ? CYCLE_STATE_CONFIG[project.cycle_state] : null;

  return (
    <div className="flex-1 min-w-0">
      {/* Project Name Row */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Color indicator */}
        <div
          className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: project.color,
            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
          }}
        />

        {/* Name - truncated on mobile */}
        <h1 className="text-lg sm:text-xl font-semibold text-[#444444] truncate">
          {project.name}
        </h1>

        {/* Cycle State Badge - compact */}
        {cycleConfig && (
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${cycleConfig.textColor} flex-shrink-0`}
            style={{
              background: cycleConfig.bgColor,
              boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.3)'
            }}
          >
            {cycleConfig.icon}
            <span className="hidden md:inline">
              {language === 'es' ? cycleConfig.labelEs : cycleConfig.labelEn}
            </span>
          </span>
        )}
      </div>

      {/* Mobile Cycle Badge - below name */}
      {cycleConfig && (
        <div className="sm:hidden mt-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${cycleConfig.textColor}`}
            style={{
              background: cycleConfig.bgColor,
              boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.3)'
            }}
          >
            {cycleConfig.icon}
            {language === 'es' ? cycleConfig.labelEs : cycleConfig.labelEn}
          </span>
        </div>
      )}

      {/* Description - hidden on very small screens */}
      {project.description && (
        <p className="hidden sm:block mt-1 text-sm text-[#888888] line-clamp-1">
          {project.description}
        </p>
      )}

      {/* Representation Primer - compact version */}
      {project.representation && (
        <div
          className="hidden md:flex mt-2 items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
          style={{
            backgroundColor: '#F0F0F3',
            boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
          }}
        >
          <Brain className="w-3.5 h-3.5 text-[#7C9EBC] flex-shrink-0" />
          <span className="text-[#888888] italic truncate">"{project.representation}"</span>
        </div>
      )}
    </div>
  );
}