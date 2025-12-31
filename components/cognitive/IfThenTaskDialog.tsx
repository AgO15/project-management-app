"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Zap, ArrowRight, Brain, AlertCircle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface Project {
    id: string
    name: string
    representation: string | null
    color: string | null
}

interface IfThenTaskDialogProps {
    children: React.ReactNode
    projectId: string
    projectRepresentation?: string | null
}

const MAX_ACTION_LENGTH = 100

export function IfThenTaskDialog({ children, projectId, projectRepresentation }: IfThenTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Traditional fields
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("medium")
    const [dueDate, setDueDate] = useState("")

    // If-Then fields (Gollwitzer Implementation Intentions)
    const [triggerIf, setTriggerIf] = useState("")
    const [actionThen, setActionThen] = useState("")
    const [isMicroObjective, setIsMicroObjective] = useState(true)

    const router = useRouter()
    const { toast } = useToast()

    // Auto-generate title from If-Then pattern (full text, no truncation)
    useEffect(() => {
        if (triggerIf && actionThen) {
            setTitle(`Si ${triggerIf} → ${actionThen}`)
        }
    }, [triggerIf, actionThen])

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPriority("medium")
        setDueDate("")
        setTriggerIf("")
        setActionThen("")
        setIsMicroObjective(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!actionThen.trim()) return

        setLoading(true)
        const supabase = createClient()

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Generate a meaningful title if not set
            const finalTitle = title.trim() || actionThen.trim()

            const { error } = await supabase.from("tasks").insert({
                title: finalTitle,
                description: description.trim() || null,
                priority,
                due_date: dueDate || null,
                project_id: projectId,
                user_id: user.id,
                // New Implementation Intention fields
                trigger_if: triggerIf.trim() || null,
                action_then: actionThen.trim(),
                is_micro_objective: isMicroObjective,
            })

            if (error) throw error

            toast({
                title: "Intención creada",
                description: "Tu micro-objetivo ha sido programado con éxito.",
            })

            setOpen(false)
            resetForm()
            router.refresh()
        } catch (error) {
            console.error("Task creation error:", error)
            toast({
                title: "Error",
                description: "No se pudo crear la tarea. Intenta de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const actionThenLength = actionThen.length
    const isActionTooLong = actionThenLength > MAX_ACTION_LENGTH

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className={cn(
                "flex flex-col overflow-hidden bg-black border-[rgba(34,197,94,0.3)]",
                "w-[95vw] max-w-lg",
                "max-h-[85vh] sm:max-h-[90vh]",
                "p-4 sm:p-6"
            )}>
                {/* Header - Compact */}
                <DialogHeader className="flex-shrink-0 pb-2 sm:pb-3">
                    <DialogTitle className="text-green-400 font-mono flex items-center gap-2 text-base sm:text-lg">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                        Nueva Intención de Implementación
                    </DialogTitle>
                    <DialogDescription className="text-green-500/60 font-mono text-xs sm:text-sm">
                        El patrón "Si-Entonces" aumenta 3x la probabilidad de ejecución.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                        {/* Project Representation Primer */}
                        {projectRepresentation && (
                            <div className="p-2.5 sm:p-3 rounded-lg border border-[rgba(34,197,94,0.2)] bg-green-500/5">
                                <div className="flex items-start gap-2">
                                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-green-500/70 font-mono mb-0.5 sm:mb-1">Este proyecto representa:</p>
                                        <p className="text-xs sm:text-sm text-green-400 font-mono italic">"{projectRepresentation}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* If-Then Mad-libs Style Input */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 text-green-500 font-mono text-xs sm:text-sm">
                                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                                INTENCIÓN DE IMPLEMENTACIÓN
                            </div>

                            {/* SI (Trigger) */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-600 text-black font-mono font-bold rounded text-xs sm:text-sm">
                                        SI
                                    </div>
                                    <span className="text-green-500/60 text-xs sm:text-sm font-mono">(disparador contextual)</span>
                                </div>
                                <Input
                                    value={triggerIf}
                                    onChange={(e) => setTriggerIf(e.target.value)}
                                    placeholder="Ej: son las 7am y me levanto..."
                                    className="h-9 bg-black/50 border-[rgba(34,197,94,0.3)] text-green-400 font-mono placeholder:text-green-500/40 text-sm"
                                />
                                <p className="text-[10px] sm:text-xs text-green-500/40 font-mono">
                                    Tip: Usa momentos específicos, lugares o eventos que ocurren naturalmente.
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center py-1">
                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 animate-pulse" />
                            </div>

                            {/* ENTONCES (Action) */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-600 text-black font-mono font-bold rounded text-xs sm:text-sm">
                                        ENTONCES
                                    </div>
                                    <span className="text-green-500/60 text-xs sm:text-sm font-mono">(micro-acción atómica)</span>
                                </div>
                                <Input
                                    value={actionThen}
                                    onChange={(e) => setActionThen(e.target.value)}
                                    placeholder="Ej: haré 10 flexiones"
                                    className={cn(
                                        "h-9 bg-black/50 border-[rgba(34,197,94,0.3)] text-green-400 font-mono placeholder:text-green-500/40 text-sm",
                                        isActionTooLong && "border-red-500/50 focus:border-red-500"
                                    )}
                                    required
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] sm:text-xs text-green-500/40 font-mono">
                                        Mantén la acción breve y específica (máx. {MAX_ACTION_LENGTH} caracteres).
                                    </p>
                                    <span className={cn(
                                        "text-[10px] sm:text-xs font-mono",
                                        isActionTooLong ? "text-red-400" : "text-green-500/40"
                                    )}>
                                        {actionThenLength}/{MAX_ACTION_LENGTH}
                                    </span>
                                </div>
                                {isActionTooLong && (
                                    <div className="flex items-center gap-1 text-red-400 text-[10px] sm:text-xs font-mono">
                                        <AlertCircle className="w-3 h-3" />
                                        La acción es demasiado larga. Los micro-objetivos deben ser atómicos.
                                    </div>
                                )}
                            </div>

                            {/* Preview */}
                            {triggerIf && actionThen && !isActionTooLong && (
                                <div className="p-2.5 sm:p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                                    <p className="text-[10px] sm:text-xs text-green-500/70 font-mono mb-1 sm:mb-2">Vista previa:</p>
                                    <p className="text-xs sm:text-sm text-green-400 font-mono">
                                        <span className="text-green-600 font-bold">SI</span> {triggerIf}{" "}
                                        <span className="text-green-600 font-bold">→ ENTONCES</span> {actionThen}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[rgba(34,197,94,0.2)]">
                            <div className="flex items-center gap-2 text-green-500/60 font-mono text-xs sm:text-sm">
                                DETALLES ADICIONALES (Opcional)
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-green-400/70 font-mono text-xs">Prioridad</Label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger className="h-9 bg-black/50 border-[rgba(34,197,94,0.2)] text-green-400 font-mono text-xs sm:text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-[rgba(34,197,94,0.3)]">
                                            <SelectItem value="low" className="text-green-400 font-mono">Baja</SelectItem>
                                            <SelectItem value="medium" className="text-green-400 font-mono">Media</SelectItem>
                                            <SelectItem value="high" className="text-green-400 font-mono">Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="due-date" className="text-green-400/70 font-mono text-xs">Fecha límite</Label>
                                    <DatePicker
                                        value={dueDate}
                                        onChange={setDueDate}
                                        placeholder="dd/mm/aaaa"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-green-400/70 font-mono text-xs">Notas adicionales</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Contexto adicional o recordatorios..."
                                    rows={2}
                                    className="bg-black/50 border-[rgba(34,197,94,0.2)] text-green-400 font-mono placeholder:text-green-500/30 text-sm resize-none"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer - Action Buttons */}
                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 flex-shrink-0 border-t border-[rgba(34,197,94,0.2)] mt-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 h-9 sm:h-10 border-[rgba(34,197,94,0.3)] text-green-400 hover:bg-green-500/10 font-mono text-xs sm:text-sm"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !actionThen.trim() || isActionTooLong}
                        className="flex-1 h-9 sm:h-10 bg-green-600 hover:bg-green-700 text-black font-mono text-xs sm:text-sm"
                        onClick={handleSubmit}
                    >
                        {loading ? "Creando..." : "Crear Intención"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

