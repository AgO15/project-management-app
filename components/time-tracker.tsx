"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, Clock, Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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
import { cn } from "@/lib/utils" // Asegúrate de importar cn

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

  // Check for active timer on mount
  useEffect(() => {
    const activeEntry = timeEntries.find((entry) => !entry.end_time)
    if (activeEntry) {
      setCurrentEntry(activeEntry)
      setIsRunning(true)
      const startTime = new Date(activeEntry.start_time).getTime()
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }
  }, [timeEntries])

  // Update elapsed time when running
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
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

      toast({
        title: "Timer started",
        description: "Time tracking has begun for this task.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start timer. Please try again.",
        variant: "destructive",
      })
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
        .update({
          end_time: new Date().toISOString(),
        })
        .eq("id", currentEntry.id)

      if (error) throw error

      setCurrentEntry(null)
      setIsRunning(false)
      setElapsedTime(0)

      toast({
        title: "Timer stopped",
        description: "Time entry has been saved successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop timer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addManualEntry = async () => {
    if (!manualDuration.trim()) return

    setLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const durationMinutes = Number.parseInt(manualDuration)
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        throw new Error("Please enter a valid duration in minutes")
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

      toast({
        title: "Time entry added",
        description: "Manual time entry has been saved successfully.",
      })

      setManualDescription("")
      setManualDuration("")
      setShowManualEntry(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add time entry",
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
        throw new Error("Please enter a valid duration in minutes")
      }

      const { error } = await supabase
        .from("time_entries")
        .update({
          description: editDescription.trim() || null,
          duration_minutes: durationMinutes,
        })
        .eq("id", entryId)

      if (error) throw error

      toast({
        title: "Time entry updated",
        description: "Time entry has been updated successfully.",
      })

      setEditingId(null)
      setEditDescription("")
      setEditDuration("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update time entry. Please try again.",
        variant: "destructive",
      })
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

      toast({
        title: "Time entry deleted",
        description: "Time entry has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete time entry. Please try again.",
        variant: "destructive",
      })
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

  // Quick time presets
  const timePresets = [30, 45, 60];

  return (
    <div className="space-y-3">
      {/* Timer Controls */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary text-primary animate-pulse bg-primary/10 font-mono text-sm">
              <Clock className="h-3 w-3 mr-2" />
              {formatElapsedTime(elapsedTime)}
            </Badge>
            <Button onClick={stopTimer} disabled={loading} size="sm" variant="destructive" className="hover:bg-destructive/80">
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
          </div>
        ) : (
          <Button onClick={() => startTimer()} disabled={loading} size="sm" className="flex items-center gap-2">
            <Play className="h-3 w-3" />
            Start Timer
          </Button>
        )}
      </div>

      {/* Time Entries Collapsible */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent hover:text-primary">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Clock className="h-4 w-4" />
            <span className="text-sm">Time Entries</span>
            <Badge variant="secondary" className="text-xs ml-1 font-mono">
              {formatDuration(totalMinutes)}
            </Badge>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <div className="space-y-3 pl-6">
            {/* Add Manual Entry */}
            <div className="flex items-center gap-2">
              <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent border-dashed border-muted-foreground/50 text-muted-foreground hover:text-primary hover:border-primary">
                    <Plus className="h-3 w-3" />
                    Add Manual Time
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md sm:max-h-[90vh] flex flex-col overflow-hidden">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Add Manual Time Entry</DialogTitle>
                    <DialogDescription>Add time that was spent on this task but not tracked.</DialogDescription>
                  </DialogHeader>

                  <ScrollArea className="flex-1 px-1">
                    <div className="space-y-4 pr-4">
                      <div className="space-y-2">
                        <Label htmlFor="manual-description">Description (Optional)</Label>
                        <Textarea
                          id="manual-description"
                          value={manualDescription}
                          onChange={(e) => setManualDescription(e.target.value)}
                          placeholder="What did you work on?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="manual-duration">Duration (minutes)</Label>
                        
                        {/* 👇 AQUÍ ESTÁN LOS BOTONES DE SELECCIÓN RÁPIDA 👇 */}
                        <div className="flex gap-2 mb-2">
                          {timePresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setManualDuration(preset.toString())}
                              className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md border transition-colors",
                                manualDuration === preset.toString()
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-transparent border-input text-muted-foreground hover:border-primary hover:text-primary"
                              )}
                            >
                              {preset}m
                            </button>
                          ))}
                        </div>

                        <Input
                          id="manual-duration"
                          type="number"
                          value={manualDuration}
                          onChange={(e) => setManualDuration(e.target.value)}
                          placeholder="60"
                          min="1"
                        />
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="flex gap-3 flex-shrink-0 pt-4">
                    <Button onClick={() => setShowManualEntry(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={addManualEntry} disabled={loading || !manualDuration.trim()} className="flex-1">
                      Add Entry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Time Entries List */}
            {timeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No time entries yet</p>
            ) : (
              <div className="space-y-2">
                {timeEntries.map((entry) => (
                  <Card key={entry.id} className="bg-muted/10 border border-border/50">
                    <CardContent className="p-3">
                      {editingId === entry.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                          />
                          <Input
                            type="number"
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            placeholder="Duration in minutes"
                            min="1"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateTimeEntry(entry.id)}
                              disabled={loading || !editDuration.trim()}
                              size="sm"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button onClick={cancelEdit} variant="outline" size="sm">
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {entry.description && (
                            <p className="text-sm font-medium text-foreground mb-1">{entry.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                              <span>
                                {formatTime(entry.start_time)}
                                {entry.end_time && ` - ${formatTime(entry.end_time)}`}
                              </span>
                              <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                                {entry.end_time ? formatDuration(entry.duration_minutes) : "Running"}
                              </Badge>
                            </div>
                            {entry.end_time && (
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => startEdit(entry)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:text-primary"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteTimeEntry(entry.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}