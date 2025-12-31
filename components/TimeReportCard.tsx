// File: components/TimeReportCard.tsx (Display Component with translations)

"use client";

import { TimeEntry } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimeReportCardProps {
  timeEntries: TimeEntry[];
  reportTitle: string;
  isLoading: boolean;
}

// Helper function to format minutes
const formatDuration = (totalMinutes: number) => {
  if (totalMinutes < 1) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  return result.trim();
};

export function TimeReportCard({ timeEntries, reportTitle, isLoading }: TimeReportCardProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <>
        <div className="text-3xl font-bold mb-4 text-[#444444]">...</div>
        <p className="text-[#888888]">Cargando datos...</p>
      </>
    );
  }

  // Calculate total time
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);

  // Group time by task
  const timeByTask = timeEntries.reduce((acc, entry) => {
    const taskTitle = entry.tasks?.title || 'Untitled Task';
    acc[taskTitle] = (acc[taskTitle] || 0) + (entry.duration_minutes || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div className="text-3xl font-bold mb-4 text-[#444444]">
        {formatDuration(totalMinutes)}
      </div>
      <div className="space-y-2 text-sm">
        <p className="font-semibold text-[#444444]">{t('timeByTask')}</p>
        {Object.keys(timeByTask).length > 0 ? (
          <ul className="list-disc pl-5 text-[#888888]">
            {Object.entries(timeByTask).map(([title, minutes]) => (
              <li key={title}>
                {title}: <strong className="text-[#444444]">{formatDuration(minutes)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#888888] italic">{t('noTimeEntries')}</p>
        )}
      </div>
    </>
  );
}