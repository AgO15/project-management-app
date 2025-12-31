"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AreaSelector } from "@/components/cognitive/AreaSelector"
import { Sparkles, Target, TrendingUp, CheckCircle2, Pause, Brain, Flag, ChevronDown, ChevronUp } from "lucide-react"
import type { ProjectCycleState } from "@/lib/types"
import { cn, getAreaColor } from "@/lib/utils"

interface AreaSelection {
    id: string;
    name: string;
    vision_statement: string | null;
}

const CYCLE_STATES: { value: ProjectCycleState; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    { value: "introduction", label: "Introducción", shortLabel: "Intro", icon: <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { value: "growth", label: "Crecimiento", shortLabel: "Crecimiento", icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { value: "stabilization", label: "Estabilización", shortLabel: "Estable", icon: <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { value: "pause", label: "Pausa", shortLabel: "Pausa", icon: <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> },
]

interface CognitiveProjectDialogProps {
    children: React.ReactNode
}

export function CognitiveProjectDialog({ children }: CognitiveProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [selectedArea, setSelectedArea] = useState<AreaSelection | null>(null)
    const [cycleState, setCycleState] = useState<ProjectCycleState>("introduction")
    const [representation, setRepresentation] = useState("")
    const [exitCriteria, setExitCriteria] = useState("")

    const router = useRouter()
    const { toast } = useToast()

    const derivedColor = getAreaColor(selectedArea?.name)

    const resetForm = () => {
        setName("")
        setDescription("")
        setSelectedArea(null)
        setCycleState("introduction")
        setRepresentation("")
        setExitCriteria("")
        setShowAdvanced(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase.from("projects").insert({
                name: name.trim(),
                description: description.trim() || null,
                color: derivedColor,
                user_id: user.id,
                area_id: selectedArea?.id || null,
                cycle_state: cycleState,
                representation: representation.trim() || null,
                exit_criteria: exitCriteria.trim() || null,
            })

            if (error) throw error

            toast({
                title: "Proyecto creado",
                description: "Tu nuevo proyecto ha sido creado con intención clara.",
            })

            setOpen(false)
            resetForm()
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo crear el proyecto. Intenta de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Neumorphic input style
    const inputStyle = {
        backgroundColor: '#E0E5EC',
        boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className={cn(
                    "flex flex-col overflow-hidden",
                    "w-[95vw] max-w-lg",
                    "max-h-[85vh] sm:max-h-[90vh]",
                    "p-0 border-0 rounded-3xl"
                )}
                style={{
                    backgroundColor: '#E0E5EC',
                    boxShadow: '20px 20px 40px rgba(163, 177, 198, 0.7), -20px -20px 40px rgba(255, 255, 255, 0.6)'
                }}
            >
                {/* Header */}
                <DialogHeader className="flex-shrink-0 p-5 sm:p-6 pb-3">
                    <DialogTitle className="text-[#444444] flex items-center gap-3 text-lg sm:text-xl">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        Nuevo Proyecto
                    </DialogTitle>
                    <DialogDescription className="text-[#888888] text-sm">
                        Define qué harás y por qué importa.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Section: Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#7C9EBC] font-medium text-xs uppercase tracking-wide">
                                <Flag className="w-3 h-3" />
                                Básico
                            </div>

                            {/* Name with Color Preview */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#444444] text-sm font-medium">
                                    Nombre *
                                </Label>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex-shrink-0 transition-colors duration-300"
                                        style={{
                                            backgroundColor: derivedColor,
                                            boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                                        }}
                                        title={selectedArea ? `Color de área: ${selectedArea.name}` : "Selecciona un área"}
                                    />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej: Maratón 2025"
                                        className="h-11 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm flex-1"
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Area Selector + Cycle State */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[#444444] text-sm font-medium flex items-center gap-1">
                                        <Target className="w-3 h-3 text-[#7C9EBC]" />
                                        Área de Vida *
                                    </Label>
                                    <AreaSelector
                                        selectedArea={selectedArea}
                                        onSelectArea={setSelectedArea}
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[#444444] text-sm font-medium">Ciclo</Label>
                                    <Select value={cycleState} onValueChange={(v) => setCycleState(v as ProjectCycleState)}>
                                        <SelectTrigger
                                            className="h-10 rounded-xl border-0 text-[#444444]"
                                            style={inputStyle}
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
                                                        <span>{state.shortLabel}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedArea && (
                                <p className="text-xs text-[#888888] flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full inline-block"
                                        style={{ backgroundColor: derivedColor }}
                                    />
                                    Color asignado por área: {selectedArea.name}
                                </p>
                            )}
                        </div>

                        {/* Toggle Advanced Options */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#888888] hover:text-[#444444] font-medium rounded-xl transition-colors"
                            style={{
                                backgroundColor: '#E0E5EC',
                                boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.6)'
                            }}
                        >
                            {showAdvanced ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Ocultar opciones avanzadas
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Mostrar opciones avanzadas
                                </>
                            )}
                        </button>

                        {/* Advanced Section */}
                        {showAdvanced && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-[#444444] text-sm font-medium">
                                        Descripción
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe brevemente el proyecto"
                                        rows={2}
                                        className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm resize-none"
                                        style={inputStyle}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="representation" className="text-[#444444] text-sm font-medium flex items-center gap-1">
                                        <Brain className="w-3 h-3 text-[#7C9EBC]" />
                                        ¿Qué representa para tu identidad?
                                    </Label>
                                    <Textarea
                                        id="representation"
                                        value={representation}
                                        onChange={(e) => setRepresentation(e.target.value)}
                                        placeholder="Ej: Mi compromiso con la disciplina..."
                                        rows={2}
                                        className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm resize-none"
                                        style={inputStyle}
                                    />
                                    <p className="text-xs text-[#888888]">
                                        Aparecerá como recordatorio al crear tareas.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="exitCriteria" className="text-[#444444] text-sm font-medium">
                                        Criterio de Salida
                                    </Label>
                                    <Input
                                        id="exitCriteria"
                                        value={exitCriteria}
                                        onChange={(e) => setExitCriteria(e.target.value)}
                                        placeholder="Ej: Cuando complete 15 días..."
                                        className="h-11 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 sm:p-6 pt-4 flex-shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="flex-1 h-11 rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3] font-medium"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="flex-1 h-11 rounded-xl text-white font-medium border-0"
                        onClick={handleSubmit}
                        style={{
                            background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {loading ? "Creando..." : "Crear Proyecto"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
