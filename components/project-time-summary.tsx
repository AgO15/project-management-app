// File: components/project-time-summary.tsx

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client" // This now works because we fixed the source file
import { Task, TimeEntry } from "@/lib/types" // 1. Import your types

interface ProjectTimeSummaryProps {
  projectId: string
}

const formatDuration = (minutes: number) => {
  if (minutes === 0) return "0m"
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function ProjectTimeSummary({ projectId }: ProjectTimeSummaryProps) {
  const [totalTime, setTotalTime] = useState(0)
  const [weeklyTime, setWeeklyTime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimeData = async () => {
      const supabase = createClient()

      try {
        // Get all tasks for this project
        const { data: tasks } = await supabase.from("tasks").select("id").eq("project_id", projectId)

        if (!tasks || tasks.length === 0) {
          setLoading(false)
          return
        }

        // 2. Apply the correct type for tasks
        const taskIds = tasks.map((task: { id: string }) => task.id)

        // Get all time entries for these tasks
        const { data: timeEntries } = await supabase
          .from("time_entries")
          .select("duration_minutes, start_time")
          .in("task_id", taskIds)
          .not("duration_minutes", "is", null)

        if (timeEntries) {
          // 3. Apply the 'TimeEntry' and 'number' types
          // Fix: timeEntries is { duration_minutes, start_time }[] but we want TimeEntry[]
          // So we need to typecast or map to TimeEntry, or just use the correct type in reduce/filter
          const total = (timeEntries as Pick<TimeEntry, "duration_minutes" | "start_time">[]).reduce(
            (sum: number, entry) => sum + (entry.duration_minutes || 0),
            0
          )
          setTotalTime(total)

          // Calculate weekly time (last 7 days)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)

          // 4. Filter for weekly entries (last 7 days)
          const weeklyEntries = timeEntries.filter(
            (entry: { duration_minutes: number; start_time: string }) =>
              new Date(entry.start_time) >= weekAgo
          )

          // 5. Sum weekly durations
          const weekly = weeklyEntries.reduce(
            (sum: number, entry) => sum + (entry.duration_minutes || 0),
            0
          )
          setWeeklyTime(weekly)
        }
      } catch (error) {
        console.error("Error fetching time data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeData()
  }, [projectId])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Total Time</span>
            <Badge variant="secondary">{formatDuration(totalTime)}</Badge>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              This Week
            </span>
            <Badge variant="outline">{formatDuration(weeklyTime)}</Badge>
          </div>
        </div>

        {totalTime === 0 && <p className="text-xs text-muted-foreground text-center py-2">No time tracked yet</p>}
      </CardContent>
    </Card>
  )
}