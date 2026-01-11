"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Calendar, Clock, AlertCircle, CheckCircle2, Circle, Play, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { TaskNotes } from "@/components/task-notes"
import { TaskFiles } from "@/components/task-files"
import { TaskChecklist } from "@/components/task-checklist"
import { HabitTracker } from "@/components/habit-tracker"
import { TimeTracker } from "@/components/time-tracker"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { cn } from "@/lib/utils"
import { ProjectCycleState } from "@/lib/types"

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
  projectCycleState?: ProjectCycleState
  createButton?: React.ReactNode
}

const STATUS_ICONS = {
  todo: Circle,
  in_progress: Play,
  completed: CheckCircle2,
}

const PRIORITY_CONFIG = {
  low: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  medium: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  high: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
}

// Neumorphic styles
const neuCardStyle = {
  backgroundColor: '#E0E5EC',
  boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.6)',
}

const neuInsetStyle = {
  backgroundColor: '#E0E5EC',
  boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)',
}

export function TaskList({ tasks, projectId, projectCycleState, createButton }: TaskListProps) {
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})

  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [taskNotes, setTaskNotes] = useState<Record<string, any[]>>({})
  const [taskFiles, setTaskFiles] = useState<Record<string, any[]>>({})
  const [taskTimeEntries, setTaskTimeEntries] = useState<Record<string, any[]>>({})
  const [taskChecklistItems, setTaskChecklistItems] = useState<Record<string, any[]>>({})
  const [taskHabitMarks, setTaskHabitMarks] = useState<Record<string, any[]>>({})

  useEffect(() => {
    const fetchTaskData = async () => {
      if (tasks.length === 0) return

      const supabase = createClient()
      const taskIds = tasks.map((task) => task.id)

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

      // Fetch checklist items
      const { data: checklistItems } = await supabase
        .from("checklist_items")
        .select("*")
        .in("task_id", taskIds)
        .order("position", { ascending: true })

      if (checklistItems) {
        const itemsByTask = checklistItems.reduce(
          (acc, item) => {
            if (!acc[item.task_id]) acc[item.task_id] = []
            acc[item.task_id].push(item)
            return acc
          },
          {} as Record<string, any[]>,
        )
        setTaskChecklistItems(itemsByTask)
      }

      // Fetch habit day marks (for introduction phase)
      const { data: habitMarks } = await supabase
        .from("habit_day_marks")
        .select("*")
        .in("task_id", taskIds)
        .order("marked_date", { ascending: true })

      if (habitMarks) {
        const marksByTask = habitMarks.reduce(
          (acc, mark) => {
            if (!acc[mark.task_id]) acc[mark.task_id] = []
            acc[mark.task_id].push(mark)
            return acc
          },
          {} as Record<string, any[]>,
        )
        setTaskHabitMarks(marksByTask)
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
        title: t('taskUpdated'),
        description: t('changesSuccessfullySaved'),
      })

      router.refresh()
    } catch (error) {
      toast({
        title: t('error'),
        description: t('couldNotUpdateTask'),
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
        title: t('delete'),
        description: t('changesSuccessfullySaved'),
      })

      router.refresh()
    } catch (error) {
      toast({
        title: t('error'),
        description: t('couldNotUpdateTask'),
        variant: "destructive",
      })
    }
  }

  if (tasks.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-3xl"
        style={neuCardStyle}
      >
        <div
          className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.4)'
          }}
        >
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[#444444] mb-2">{t('noTasksYet')}</h3>
        <p className="text-[#888888] mb-4">{t('createFirstTask')}</p>
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
      <div className="w-full flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="w-full max-w-md grid grid-cols-2 gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger
              className="w-full h-11 text-base rounded-xl border-0 text-[#444444]"
              style={neuInsetStyle}
            >
              <SelectValue placeholder={t('filterBy')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0" style={{ backgroundColor: '#F0F0F3' }}>
              <SelectItem value="all" className="rounded-lg">{t('allTasks')}</SelectItem>
              <SelectItem value="todo" className="rounded-lg">{t('todo')}</SelectItem>
              <SelectItem value="in_progress" className="rounded-lg">{t('inProgress')}</SelectItem>
              <SelectItem value="completed" className="rounded-lg">{t('completed')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className="w-full h-11 text-base rounded-xl border-0 text-[#444444]"
              style={neuInsetStyle}
            >
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0" style={{ backgroundColor: '#F0F0F3' }}>
              <SelectItem value="created_at" className="rounded-lg">{t('createdAt')}</SelectItem>
              <SelectItem value="priority" className="rounded-lg">{t('priority')}</SelectItem>
              <SelectItem value="due_date" className="rounded-lg">{t('dueDate')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-[#888888]">
          {filteredTasks.length} / {tasks.length} {t('tasksCount')}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {sortedTasks.map((task) => {
          const StatusIcon = STATUS_ICONS[task.status as keyof typeof STATUS_ICONS]
          const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"
          const showDueDate = sortBy !== "created_at"

          return (
            <div
              key={task.id}
              className="rounded-2xl p-4 sm:p-5 transition-all hover:scale-[1.01]"
              style={neuCardStyle}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-lg mt-1 cursor-pointer"
                  style={task.status === "completed" ? {
                    background: 'linear-gradient(145deg, #34D399, #10B981)',
                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                  } : neuInsetStyle}
                  onClick={() => updateTaskStatus(task.id, task.status === "completed" ? "todo" : "completed")}
                >
                  {task.status === "completed" && <CheckCircle2 className="h-4 w-4 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-medium text-base sm:text-lg break-words",
                          task.status === "completed"
                            ? "line-through text-[#aaa]"
                            : "text-[#444444]"
                        )}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        (() => {
                          const isExpanded = !!expandedDescriptions[task.id]
                          const maxLen = 140
                          const text = task.description
                          const shouldTruncate = text.length > maxLen && !isExpanded
                          const displayed = shouldTruncate ? `${text.slice(0, maxLen)}...` : text
                          return (
                            <p className="text-sm text-[#888888] mt-1 whitespace-pre-wrap">
                              {displayed}
                              {shouldTruncate ? (
                                <button
                                  className="ml-1 underline text-[#7C9EBC] hover:text-[#5A7C9A]"
                                  onClick={() => setExpandedDescriptions({ ...expandedDescriptions, [task.id]: true })}
                                >
                                  {t('seeMore')}
                                </button>
                              ) : null}
                            </p>
                          )
                        })()
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Acciones"
                          className="rounded-xl text-[#888] hover:text-[#444] hover:bg-[#F0F0F3]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border-0"
                        style={{ backgroundColor: '#F0F0F3', boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.5)' }}
                      >
                        <DropdownMenuItem
                          onClick={() => setEditingTask(task)}
                          className="flex items-center gap-2 rounded-lg"
                        >
                          <Pencil className="h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[rgba(163,177,198,0.3)]" />
                        <DropdownMenuItem
                          onClick={() => updateTaskStatus(task.id, "todo")}
                          disabled={task.status === "todo"}
                          className="rounded-lg"
                        >
                          {t('markAsTodo')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateTaskStatus(task.id, "in_progress")}
                          disabled={task.status === "in_progress"}
                          className="rounded-lg"
                        >
                          {t('markAsInProgress')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateTaskStatus(task.id, "completed")}
                          disabled={task.status === "completed"}
                          className="rounded-lg"
                        >
                          {t('markAsCompleted')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[rgba(163,177,198,0.3)]" />
                        <DropdownMenuItem
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 rounded-lg"
                        >
                          {t('deleteTask')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                      style={neuInsetStyle}
                    >
                      <StatusIcon className="h-3.5 w-3.5 text-[#7C9EBC]" />
                      <span className="text-[#666] capitalize">
                        {task.status === "todo" ? t('todo') : task.status === "in_progress" ? t('inProgress') : t('completed')}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border",
                        priorityConfig?.bg,
                        priorityConfig?.border,
                        priorityConfig?.color
                      )}
                    >
                      <AlertCircle className="h-3 w-3" />
                      {task.priority === "low" ? t('low') : task.priority === "medium" ? t('medium') : t('high')}
                    </div>

                    {showDueDate ? (
                      task.due_date && (
                        <div
                          className={cn(
                            "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg",
                            isOverdue ? "bg-red-50 text-red-500 border border-red-200" : ""
                          )}
                          style={!isOverdue ? neuInsetStyle : undefined}
                        >
                          <Calendar className="h-3 w-3" />
                          <span className={!isOverdue ? "text-[#666]" : ""}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                          {isOverdue && <span className="font-medium">({t('overdue')})</span>}
                        </div>
                      )
                    ) : (
                      <div
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                        style={neuInsetStyle}
                      >
                        <Clock className="h-3 w-3 text-[#7C9EBC]" />
                        <span className="text-[#666]">{new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Expandable sections */}
                  <div className="mt-4 pt-4 border-t border-[rgba(163,177,198,0.3)] space-y-3">
                    <TimeTracker taskId={task.id} timeEntries={taskTimeEntries[task.id] || []} />
                    {projectCycleState === "introduction" && (
                      <HabitTracker taskId={task.id} marks={taskHabitMarks[task.id] || []} />
                    )}
                    <TaskNotes taskId={task.id} notes={taskNotes[task.id] || []} projectId={projectId} />
                    <TaskChecklist taskId={task.id} items={taskChecklistItems[task.id] || []} />
                    <TaskFiles taskId={task.id} files={taskFiles[task.id] || []} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </div>
  )
}