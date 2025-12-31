"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { updateProjectField } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaSelector } from "@/components/cognitive/AreaSelector";
import { CapacityAlertModal } from "@/components/cognitive/CapacityAlertModal";
import { canChangeToCycleState } from "@/components/cognitive/CognitiveCapacityBanner";
import {
    Settings,
    Sparkles,
    TrendingUp,
    CheckCircle2,
    Pause,
    Brain,
    Target,
    Loader2,
    Check
} from "lucide-react";
import { cn, getAreaColor } from "@/lib/utils";
import type { ProjectCycleState } from "@/lib/types";

interface AreaSelection {
    id: string;
    name: string;
    vision_statement: string | null;
}

interface Project {
    id: string;
    name: string;
    description: string | null;
    color: string;
    status: string;
    cycle_state?: ProjectCycleState;
    representation?: string | null;
    exit_criteria?: string | null;
    area_id?: string | null;
}

interface ProjectForCapacity {
    id: string;
    name: string;
    cycle_state?: ProjectCycleState | null;
}

interface ProjectCognitiveSettingsProps {
    project: Project;
    initialArea?: AreaSelection | null;
    allProjects?: ProjectForCapacity[];
}

const CYCLE_STATES: { value: ProjectCycleState; label: string; icon: React.ReactNode }[] = [
    { value: "introduction", label: "Introducción", icon: <Sparkles className="w-4 h-4" /> },
    { value: "growth", label: "Crecimiento", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "stabilization", label: "Estabilización", icon: <CheckCircle2 className="w-4 h-4" /> },
    { value: "pause", label: "Pausa", icon: <Pause className="w-4 h-4" /> },
];

// Neumorphic styles
const neuCardStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: '9px 9px 18px rgba(163, 177, 198, 0.6), -9px -9px 18px rgba(255, 255, 255, 0.5)',
};

const neuInsetStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function ProjectCognitiveSettings({ project, initialArea, allProjects }: ProjectCognitiveSettingsProps) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [capacityAlertOpen, setCapacityAlertOpen] = useState(false);
    const [capacityAlertMessage, setCapacityAlertMessage] = useState("");

    const [cycleState, setCycleState] = useState<ProjectCycleState>(project.cycle_state || "pause");
    const [representation, setRepresentation] = useState(project.representation || "");
    const [exitCriteria, setExitCriteria] = useState(project.exit_criteria || "");
    const [selectedArea, setSelectedArea] = useState<AreaSelection | null>(initialArea || null);

    const derivedColor = getAreaColor(selectedArea?.name);

    const initializedRef = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const saveField = useCallback(async (field: string, value: string | null) => {
        setSaveStatus("saving");
        try {
            const result = await updateProjectField(project.id, field as any, value);
            if (result.success) {
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 1500);
            } else {
                setSaveStatus("error");
                toast.error(`Error: ${result.error}`);
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        } catch (error) {
            setSaveStatus("error");
            toast.error("Error al guardar");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }
    }, [project.id]);

    const saveMultipleFields = useCallback(async (updates: { field: string; value: string | null }[]) => {
        setSaveStatus("saving");
        try {
            const results = await Promise.all(
                updates.map(({ field, value }) => updateProjectField(project.id, field as any, value))
            );

            const failed = results.filter(r => !r.success);
            if (failed.length === 0) {
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 1500);
            } else {
                setSaveStatus("error");
                toast.error(`Error: ${failed[0]?.error}`);
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        } catch (error) {
            setSaveStatus("error");
            toast.error("Error al guardar");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }
    }, [project.id]);

    const debouncedSave = useCallback((field: string, value: string | null) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            saveField(field, value);
        }, 800);
    }, [saveField]);

    const handleCycleStateChange = useCallback((value: ProjectCycleState) => {
        if (allProjects) {
            const validation = canChangeToCycleState(allProjects, project.id, value);
            if (!validation.allowed) {
                setCapacityAlertMessage(validation.message || "Capacidad al límite");
                setCapacityAlertOpen(true);
                return;
            }
        }

        setCycleState(value);
        if (initializedRef.current) {
            saveField("cycle_state", value);
        }
    }, [saveField, allProjects, project.id]);

    const handleAreaChange = useCallback((area: AreaSelection | null) => {
        setSelectedArea(area);
        if (initializedRef.current) {
            const newColor = getAreaColor(area?.name);
            saveMultipleFields([
                { field: "area_id", value: area?.id || null },
                { field: "color", value: newColor }
            ]);
        }
    }, [saveMultipleFields]);

    const handleRepresentationChange = useCallback((value: string) => {
        setRepresentation(value);
        if (initializedRef.current) {
            debouncedSave("representation", value || null);
        }
    }, [debouncedSave]);

    const handleExitCriteriaChange = useCallback((value: string) => {
        setExitCriteria(value);
        if (initializedRef.current) {
            debouncedSave("exit_criteria", value || null);
        }
    }, [debouncedSave]);

    useEffect(() => {
        initializedRef.current = true;
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const StatusIndicator = () => {
        if (saveStatus === "saving") {
            return (
                <span className="flex items-center gap-1 text-xs text-amber-500 font-normal">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Guardando...
                </span>
            );
        }
        if (saveStatus === "saved") {
            return (
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-normal">
                    <Check className="w-3 h-3" />
                    Guardado
                </span>
            );
        }
        if (saveStatus === "error") {
            return (
                <span className="text-xs text-red-500 font-normal">
                    Error
                </span>
            );
        }
        return null;
    };

    return (
        <>
            <div
                className="rounded-3xl overflow-hidden"
                style={neuCardStyle}
            >
                {/* Header */}
                <div className="p-4 pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#7C9EBC]">
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <Settings className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-[#444444]">Configuración Cognitiva</span>
                        </div>
                        <StatusIndicator />
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-4 space-y-4">

                    {/* Row 1: Area + Cycle State */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Area */}
                        <div className="space-y-1.5">
                            <Label className="text-[#7C9EBC] text-xs flex items-center gap-1 font-medium">
                                <Target className="w-3 h-3" />
                                Área de Vida
                            </Label>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-10 rounded-xl flex-shrink-0 transition-colors duration-300"
                                    style={{
                                        backgroundColor: derivedColor,
                                        boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                    }}
                                    title={selectedArea ? `Color: ${selectedArea.name}` : "Sin área"}
                                />
                                <AreaSelector
                                    selectedArea={selectedArea}
                                    onSelectArea={handleAreaChange}
                                    className="h-10 text-xs flex-1"
                                />
                            </div>
                        </div>

                        {/* Cycle State */}
                        <div className="space-y-1.5">
                            <Label className="text-[#7C9EBC] text-xs flex items-center gap-1 font-medium">
                                <Sparkles className="w-3 h-3" />
                                Estado del Ciclo
                            </Label>
                            <Select value={cycleState} onValueChange={(v) => handleCycleStateChange(v as ProjectCycleState)}>
                                <SelectTrigger
                                    className="h-10 rounded-xl border-0 text-[#444444] text-sm"
                                    style={neuInsetStyle}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent
                                    className="rounded-xl border-0"
                                    style={{ backgroundColor: '#F0F0F3' }}
                                >
                                    {CYCLE_STATES.map((state) => (
                                        <SelectItem
                                            key={state.value}
                                            value={state.value}
                                            className="text-[#444444] hover:bg-[#E0E5EC] focus:bg-[#E0E5EC] rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                {state.icon}
                                                <span>{state.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Area color hint */}
                    {selectedArea && (
                        <p className="text-xs text-[#888888] flex items-center gap-1.5 -mt-2">
                            <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: derivedColor }}
                            />
                            Color asignado por área: {selectedArea.name}
                        </p>
                    )}

                    {/* Representation */}
                    <div className="space-y-1.5">
                        <Label className="text-[#7C9EBC] text-xs flex items-center gap-1 font-medium">
                            <Brain className="w-3 h-3" />
                            ¿Qué representa para tu identidad?
                        </Label>
                        <Textarea
                            value={representation}
                            onChange={(e) => handleRepresentationChange(e.target.value)}
                            placeholder="Ej: Mi compromiso con la disciplina y la salud..."
                            rows={2}
                            className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm resize-none"
                            style={neuInsetStyle}
                        />
                        <p className="text-xs text-[#888888]">
                            Este texto aparece al crear tareas como recordatorio.
                        </p>
                    </div>

                    {/* Exit Criteria */}
                    <div className="space-y-1.5">
                        <Label className="text-[#7C9EBC] text-xs font-medium">
                            Criterio de Salida
                        </Label>
                        <Input
                            value={exitCriteria}
                            onChange={(e) => handleExitCriteriaChange(e.target.value)}
                            placeholder="Ej: Cuando complete 15 días consecutivos..."
                            className="h-10 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm"
                            style={neuInsetStyle}
                        />
                    </div>
                </div>
            </div>

            {/* Capacity Alert Modal */}
            <CapacityAlertModal
                open={capacityAlertOpen}
                onOpenChange={setCapacityAlertOpen}
                message={capacityAlertMessage}
            />
        </>
    );
}
