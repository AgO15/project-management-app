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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Pencil, AlertCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    due_date: string | null
}

interface EditTaskDialogProps {
    task: Task
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
    const [loading, setLoading] = useState(false)

    // Form state
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || "")
    const [priority, setPriority] = useState(task.priority)
    const [dueDate, setDueDate] = useState(task.due_date || "")
    const [status, setStatus] = useState(task.status)

    const router = useRouter()
    const { toast } = useToast()

    // Reset form when task changes
    useEffect(() => {
        setTitle(task.title)
        setDescription(task.description || "")
        setPriority(task.priority)
        setDueDate(task.due_date || "")
        setStatus(task.status)
    }, [task])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("tasks")
                .update({
                    title: title.trim(),
                    description: description.trim() || null,
                    priority,
                    due_date: dueDate || null,
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", task.id)

            if (error) throw error

            toast({
                title: "Tarea actualizada",
                description: "Los cambios han sido guardados correctamente.",
            })

            onOpenChange(false)
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo actualizar la tarea. Intenta de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "flex flex-col overflow-hidden bg-black border-[rgba(34,197,94,0.3)]",
                "w-[95vw] max-w-md",
                "max-h-[85vh] sm:max-h-[90vh]",
                "p-4 sm:p-6"
            )}>
                {/* Header */}
                <DialogHeader className="flex-shrink-0 pb-2">
                    <DialogTitle className="text-green-400 font-mono flex items-center gap-2 text-base sm:text-lg">
                        <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                        Editar Tarea
                    </DialogTitle>
                    <DialogDescription className="text-green-500/60 font-mono text-xs sm:text-sm">
                        Modifica los detalles de la tarea.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-title" className="text-green-400 font-mono text-xs sm:text-sm">
                                Título *
                            </Label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Título de la tarea"
                                className="h-9 bg-black/50 border-[rgba(34,197,94,0.3)] text-green-400 font-mono placeholder:text-green-500/40 text-sm"
                                required
                            />
                        </div>

                        {/* Priority + Due Date */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Priority */}
                            <div className="space-y-1.5">
                                <Label className="text-green-400 font-mono text-xs sm:text-sm flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Urgencia
                                </Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="h-9 bg-black/50 border-[rgba(34,197,94,0.3)] text-green-400 font-mono text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-[rgba(34,197,94,0.3)]">
                                        <SelectItem value="low" className="text-green-400 font-mono">Baja</SelectItem>
                                        <SelectItem value="medium" className="text-yellow-400 font-mono">Media</SelectItem>
                                        <SelectItem value="high" className="text-red-400 font-mono">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-1.5">
                                <Label className="text-green-400 font-mono text-xs sm:text-sm flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Fecha límite
                                </Label>
                                <DatePicker
                                    value={dueDate}
                                    onChange={setDueDate}
                                    placeholder="dd/mm/aaaa"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label className="text-green-400 font-mono text-xs sm:text-sm">
                                Estado
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-9 bg-black/50 border-[rgba(34,197,94,0.3)] text-green-400 font-mono text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black border-[rgba(34,197,94,0.3)]">
                                    <SelectItem value="todo" className="text-green-400 font-mono">Por hacer</SelectItem>
                                    <SelectItem value="in_progress" className="text-yellow-400 font-mono">En progreso</SelectItem>
                                    <SelectItem value="completed" className="text-blue-400 font-mono">Completada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-description" className="text-green-400 font-mono text-xs sm:text-sm">
                                Descripción
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Descripción de la tarea..."
                                rows={3}
                                className="bg-black/50 border-[rgba(34,197,94,0.3)] text-green-400 font-mono placeholder:text-green-500/40 text-sm resize-none"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer - Action Buttons */}
                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 flex-shrink-0 border-t border-[rgba(34,197,94,0.2)] mt-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-9 sm:h-10 border-[rgba(34,197,94,0.3)] text-green-400 hover:bg-green-500/10 font-mono text-xs sm:text-sm"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="flex-1 h-9 sm:h-10 bg-green-600 hover:bg-green-700 text-black font-mono text-xs sm:text-sm"
                        onClick={handleSubmit}
                    >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
