// File: components/task-list.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Calendar, Clock, AlertCircle, CheckCircle2, Circle, Play } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { TaskNotes } from "@/components/task-notes"
import { TaskFiles } from "@/components/task-files"
import { TimeTracker } from "@/components/time-tracker"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  created_at: string
  updated_at: string
}

interface TaskListProps {
  tasks: Task[]
  projectId: string
  createButton?: React.ReactNode
}

const STATUS_ICONS = {
  todo: Circle,
  in_progress: Play,
  completed: CheckCircle2,
}

const PRIORITY_COLORS = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
}

export function TaskList({ tasks, projectId, createButton }: TaskListProps) {
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const router = useRouter()
  const { toast } = useToast()

  const [taskNotes, setTaskNotes] = useState<Record<string, any[]>>({})
  const [taskFiles, setTaskFiles] = useState<Record<string, any[]>>({})
  const [taskTimeEntries, setTaskTimeEntries] = useState<Record<string, any[]>>({})

  useEffect(() => {
    const fetchTaskData = async () => {
      if (tasks.length === 0) return

      const supabase = createClient()
      const taskIds = tasks.map((task) => task.id)

      // Fetch notes
      const { data: notes } = await supabase
        .from("notes")
        .select("*")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false })

      if (notes) {
        const notesByTask = notes.reduce(
          (acc, note) => {
            if (!acc[note.task_id]) acc[note.task_id] = []
            acc[note.task_id].push(note)
            return acc
          },
          {} as Record<string, any[]>,
        )

        setTaskNotes(notesByTask)
      }

      // Fetch files
      const { data: files } = await supabase
        .from("files")
        .select("*")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false })

      if (files) {
        const filesByTask = files.reduce(
          (acc, file) => {
            if (!acc[file.task_id]) acc[file.task_id] = []
            acc[file.task_id].push(file)
            return acc
          },
          {} as Record<string, any[]>,
        )

        setTaskFiles(filesByTask)
      }

      // Fetch time entries
      const { data: timeEntries } = await supabase
        .from("time_entries")
        .select("*")
        .in("task_id", taskIds)
        .order("start_time", { ascending: false })

      if (timeEntries) {
        const entriesByTask = timeEntries.reduce(
          (acc, entry) => {
            if (!acc[entry.task_id]) acc[entry.task_id] = []
            acc[entry.task_id].push(entry)
            return acc
          },
          {} as Record<string, any[]>,
        )

        setTaskTimeEntries(entriesByTask)
      }
    }

    fetchTaskData()
  }, [tasks])

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    return task.status === filter
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return (
          priorityOrder[b.priority as keyof typeof priorityOrder] -
          priorityOrder[a.priority as keyof typeof priorityOrder]
        )
      case "due_date":
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", taskId)

      if (error) throw error

      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      })
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
        <p className="text-muted-foreground mb-4">Create your first task to start organizing your work</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create button above filters */}
      {createButton && (
        <div>
          {createButton}
        </div>
      )}
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const StatusIcon = STATUS_ICONS[task.status as keyof typeof STATUS_ICONS]
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

          return (
            <Card key={task.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => updateTaskStatus(task.id, checked ? "completed" : "todo")}
                    className="mt-1 h-5 w-5"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3
                          className={`font-medium text-base sm:text-lg ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label="Task actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => updateTaskStatus(task.id, "todo")}
                            disabled={task.status === "todo"}
                          >
                            Mark as To Do
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateTaskStatus(task.id, "in_progress")}
                            disabled={task.status === "in_progress"}
                          >
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateTaskStatus(task.id, "completed")}
                            disabled={task.status === "completed"}
                          >
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <StatusIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground capitalize">
                          {task.status.replace("_", " ")}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>

                      {task.due_date && (
                        <div
                          className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}
                        >
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                          {isOverdue && <span className="font-medium">(Overdue)</span>}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="h-3 w-3" />
                        {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <div className="sm:max-w-xs">
                        <Button className="w-full sm:w-auto mb-2" variant="default">Start Timer</Button>
                      </div>
                      <TimeTracker taskId={task.id} timeEntries={taskTimeEntries[task.id] || []} />
                      <TaskNotes taskId={task.id} notes={taskNotes[task.id] || []} />
                      <TaskFiles taskId={task.id} files={taskFiles[task.id] || []} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}