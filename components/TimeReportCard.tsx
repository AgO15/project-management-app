// File: components/TimeReportCard.tsx

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { TimeEntry } from "@/lib/types";

interface TimeReportCardProps {
  timeEntries: TimeEntry[];
}

// A helper function to format minutes into hours and minutes
const formatDuration = (totalMinutes: number) => {
  if (totalMinutes < 1) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  return result.trim();
};

export function TimeReportCard({ timeEntries }: TimeReportCardProps) {
  // Calculate the total time from all entries
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);

  // Group time by task
  const timeByTask = timeEntries.reduce((acc, entry) => {
    const taskTitle = entry.tasks?.title || 'Untitled Task';
    acc[taskTitle] = (acc[taskTitle] || 0) + (entry.duration_minutes || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <Link href="/dashboard/reports">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Time Report (Last 7 Days)</CardTitle>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">
            {formatDuration(totalMinutes)}
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Time by Task:</p>
            {Object.keys(timeByTask).length > 0 ? (
              <ul className="list-disc pl-5 text-muted-foreground">
                {Object.entries(timeByTask).map(([title, minutes]) => (
                  <li key={title}>
                    {title}: <strong>{formatDuration(minutes)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No time tracked in the last 7 days.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}