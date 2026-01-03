"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, Clock, Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { LinkifiedText } from "@/components/LinkifiedText"

interface TimeEntry {
  id: string
  description: string | null
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  created_at: string
}

interface TimeTrackerProps {
  taskId: string
  timeEntries: TimeEntry[]
}

// Neumorphic styles
const neuCardStyle = {
  backgroundColor: '#F0F0F3',
  boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.6)',
}

const neuInsetStyle = {
  backgroundColor: '#E0E5EC',
  boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)',
}

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "0m"
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TimeTracker({ taskId, timeEntries }: TimeTrackerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualDescription, setManualDescription] = useState("")
  const [manualDuration, setManualDuration] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    const activeEntry = timeEntries.find((entry) => !entry.end_time)
    if (activeEntry) {
      setCurrentEntry(activeEntry)
      setIsRunning(true)
      const startTime = new Date(activeEntry.start_time).getTime()
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }
  }, [timeEntries])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && currentEntry) {
      interval = setInterval(() => {
        const startTime = new Date(currentEntry.start_time).getTime()
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, currentEntry])

  const startTimer = async (description?: string) => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          description: description || null,
          start_time: new Date().toISOString(),
          task_id: taskId,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setCurrentEntry(data)
      setIsRunning(true)
      setElapsedTime(0)

      toast({ title: t('timerRunning'), description: t('changesSuccessfullySaved') })
      router.refresh()
    } catch (error) {
      toast({ title: t('error'), description: t('couldNotUpdateTask'), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const stopTimer = async () => {
    if (!currentEntry) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("time_entries")
        .update({ end_time: new Date().toISOString() })
        .eq("id", currentEntry.id)

      if (error) throw error

      setCurrentEntry(null)
      setIsRunning(false)
      setElapsedTime(0)

      toast({ title: t('saved'), description: t('changesSuccessfullySaved') })
      router.refresh()
    } catch (error) {
      toast({ title: t('error'), description: t('couldNotUpdateTask'), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const addManualEntry = async () => {
    if (!manualDuration.trim()) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const durationMinutes = Number.parseInt(manualDuration)
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        throw new Error("Ingresa una duración válida en minutos")
      }

      const now = new Date()
      const startTime = new Date(now.getTime() - durationMinutes * 60 * 1000)

      const { error } = await supabase.from("time_entries").insert({
        description: manualDescription.trim() || null,
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        task_id: taskId,
        user_id: user.id,
      })

      if (error) throw error

      toast({ title: "Tiempo añadido", description: "El registro manual ha sido guardado." })

      setManualDescription("")
      setManualDuration("")
      setShowManualEntry(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo añadir el registro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTimeEntry = async (entryId: string) => {
    if (!editDuration.trim()) return

    setLoading(true)
    const supabase = createClient()

    try {
      const durationMinutes = Number.parseInt(editDuration)
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        throw new Error("Ingresa una duración válida")
      }

      const { error } = await supabase
        .from("time_entries")
        .update({
          description: editDescription.trim() || null,
          duration_minutes: durationMinutes,
        })
        .eq("id", entryId)

      if (error) throw error

      toast({ title: "Registro actualizado", description: "El tiempo ha sido actualizado." })

      setEditingId(null)
      setEditDescription("")
      setEditDuration("")
      router.refresh()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el registro.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const deleteTimeEntry = async (entryId: string) => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("time_entries").delete().eq("id", entryId)

      if (error) throw error

      toast({ title: "Registro eliminado", description: "El tiempo ha sido eliminado." })
      router.refresh()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id)
    setEditDescription(entry.description || "")
    setEditDuration(entry.duration_minutes?.toString() || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDescription("")
    setEditDuration("")
  }

  const totalMinutes = timeEntries
    .filter((entry) => entry.duration_minutes)
    .reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const timePresets = [30, 45, 60]

  return (
    <div className="space-y-3">
      {/* Timer Controls */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm text-emerald-600 animate-pulse"
              style={{
                backgroundColor: '#D1FAE5',
                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.5)'
              }}
            >
              <Clock className="h-3 w-3" />
              {formatElapsedTime(elapsedTime)}
            </div>
            <Button
              onClick={stopTimer}
              disabled={loading}
              size="sm"
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Square className="h-3 w-3 mr-1" />
              Detener
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => startTimer()}
            disabled={loading}
            size="sm"
            className="flex items-center gap-2 rounded-xl text-white border-0"
            style={{
              background: 'linear-gradient(145deg, #34D399, #10B981)',
              boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
            }}
          >
            <Play className="h-3 w-3" />
            Iniciar Timer
          </Button>
        )}
      </div>

      {/* Time Entries Collapsible */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 p-0 h-auto hover:bg-transparent text-[#666] hover:text-[#444]"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Clock className="h-4 w-4 text-[#7C9EBC]" />
            <span className="text-sm">Time Entries</span>
            <span
              className="text-xs px-2 py-0.5 rounded-lg font-mono"
              style={neuInsetStyle}
            >
              {formatDuration(totalMinutes)}
            </span>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <div className="space-y-3 pl-6">
            {/* Add Manual Entry */}
            <div className="flex items-center gap-2">
              <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-[#888] hover:text-[#7C9EBC] rounded-xl border border-dashed border-[rgba(163,177,198,0.5)]"
                  >
                    <Plus className="h-3 w-3" />
                    Añadir tiempo manual
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-md flex flex-col overflow-hidden rounded-3xl border-0 p-0"
                  style={{ backgroundColor: '#E0E5EC', boxShadow: '20px 20px 40px rgba(163, 177, 198, 0.7), -20px -20px 40px rgba(255, 255, 255, 0.6)' }}
                >
                  <DialogHeader className="p-5 pb-3">
                    <DialogTitle className="text-[#444444]">Añadir tiempo manual</DialogTitle>
                    <DialogDescription className="text-[#888888]">
                      Añade tiempo que no fue registrado automáticamente.
                    </DialogDescription>
                  </DialogHeader>

                  <ScrollArea className="flex-1 px-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[#444444] text-sm">Descripción (Opcional)</Label>
                        <Textarea
                          value={manualDescription}
                          onChange={(e) => setManualDescription(e.target.value)}
                          placeholder="¿En qué trabajaste?"
                          rows={2}
                          className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] resize-none"
                          style={neuInsetStyle}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[#444444] text-sm">Duración (minutos)</Label>
                        <div className="flex gap-2 mb-2">
                          {timePresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setManualDuration(preset.toString())}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-xl transition-all",
                                manualDuration === preset.toString()
                                  ? "text-white"
                                  : "text-[#666]"
                              )}
                              style={manualDuration === preset.toString() ? {
                                background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                              } : neuInsetStyle}
                            >
                              {preset}m
                            </button>
                          ))}
                        </div>
                        <Input
                          type="number"
                          value={manualDuration}
                          onChange={(e) => setManualDuration(e.target.value)}
                          placeholder="60"
                          min="1"
                          className="h-11 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa]"
                          style={neuInsetStyle}
                        />
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="flex gap-3 p-5 pt-3">
                    <Button
                      onClick={() => setShowManualEntry(false)}
                      variant="ghost"
                      className="flex-1 h-11 rounded-xl text-[#888] hover:text-[#444] hover:bg-[#F0F0F3]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={addManualEntry}
                      disabled={loading || !manualDuration.trim()}
                      className="flex-1 h-11 rounded-xl text-white border-0"
                      style={{
                        background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                        boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      Añadir
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Time Entries List */}
            {timeEntries.length === 0 ? (
              <p className="text-sm text-[#888888] italic">Sin registros de tiempo</p>
            ) : (
              <div className="space-y-2">
                {timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl"
                    style={neuCardStyle}
                  >
                    {editingId === entry.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Descripción (opcional)"
                          rows={2}
                          className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] resize-none"
                          style={neuInsetStyle}
                        />
                        <Input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          placeholder="Duración en minutos"
                          min="1"
                          className="h-10 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa]"
                          style={neuInsetStyle}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateTimeEntry(entry.id)}
                            disabled={loading || !editDuration.trim()}
                            size="sm"
                            className="rounded-xl text-white border-0"
                            style={{
                              background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                            }}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Guardar
                          </Button>
                          <Button onClick={cancelEdit} variant="ghost" size="sm" className="rounded-xl text-[#888]">
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {entry.description && (
                          <LinkifiedText text={entry.description} className="text-sm font-medium text-[#444444] mb-1" />
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-[#888888] font-mono">
                            <span>
                              {formatTime(entry.start_time)}
                              {entry.end_time && ` - ${formatTime(entry.end_time)}`}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-lg"
                              style={neuInsetStyle}
                            >
                              {entry.end_time ? formatDuration(entry.duration_minutes) : "Activo"}
                            </span>
                          </div>
                          {entry.end_time && (
                            <div className="flex gap-1">
                              <Button
                                onClick={() => startEdit(entry)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-lg text-[#888] hover:text-[#7C9EBC]"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => deleteTimeEntry(entry.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-lg text-red-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}