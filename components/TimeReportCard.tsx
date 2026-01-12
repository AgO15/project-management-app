// File: components/TimeReportCard.tsx (Optimized compact display)

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

// Colors for project bars
const PROJECT_COLORS = [
  '#7C9EBC', // blue-gray
  '#A78BFA', // purple
  '#34D399', // emerald
  '#FBBF24', // amber
  '#F87171', // red
  '#60A5FA', // blue
];

export function TimeReportCard({ timeEntries, reportTitle, isLoading }: TimeReportCardProps) {
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <>
        <div className="text-3xl font-bold mb-4 text-[#444444]">...</div>
        <p className="text-[#888888]">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
      </>
    );
  }

  // Calculate total time
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);

  // Calculate unique days worked
  const uniqueDays = new Set(
    timeEntries.map(entry => entry.start_time.split('T')[0])
  ).size;

  // Daily average
  const dailyAverage = uniqueDays > 0 ? Math.round(totalMinutes / uniqueDays) : 0;

  // Number of work sessions
  const sessionCount = timeEntries.length;

  // Group time by project
  const timeByProject = timeEntries.reduce((acc, entry) => {
    const projectName = entry.tasks?.projects?.name || 'Sin proyecto';
    acc[projectName] = (acc[projectName] || 0) + (entry.duration_minutes || 0);
    return acc;
  }, {} as Record<string, number>);

  // Get top projects for mini bar (max 5)
  const topProjects = Object.entries(timeByProject)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const hasData = totalMinutes > 0;

  return (
    <>
      {/* Main Stats Row */}
      <div className="flex items-end gap-6 mb-4">
        {/* Total Time - Large */}
        <div>
          <div className="text-3xl font-bold text-[#444444]">
            {formatDuration(totalMinutes)}
          </div>
          <p className="text-xs text-[#888888]">{language === 'es' ? 'total' : 'total'}</p>
        </div>

        {/* Daily Average */}
        <div>
          <div className="text-xl font-semibold text-[#7C9EBC]">
            {formatDuration(dailyAverage)}
          </div>
          <p className="text-xs text-[#888888]">{language === 'es' ? 'promedio/día' : 'avg/day'}</p>
        </div>

        {/* Sessions Count */}
        <div>
          <div className="text-xl font-semibold text-[#A78BFA]">
            {sessionCount}
          </div>
          <p className="text-xs text-[#888888]">{language === 'es' ? 'sesiones' : 'sessions'}</p>
        </div>
      </div>

      {/* Mini Project Distribution Bar */}
      {hasData && topProjects.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#888888] font-medium">
            {language === 'es' ? 'Distribución' : 'Distribution'}
          </p>

          {/* Stacked Bar */}
          <div
            className="h-3 rounded-full overflow-hidden flex"
            style={{
              backgroundColor: '#D1D5DB',
              boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {topProjects.map(([projectName, minutes], index) => {
              const percentage = (minutes / totalMinutes) * 100;
              return (
                <div
                  key={projectName}
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: PROJECT_COLORS[index % PROJECT_COLORS.length],
                  }}
                  title={`${projectName}: ${formatDuration(minutes)}`}
                />
              );
            })}
          </div>

          {/* Legend - Compact */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {topProjects.slice(0, 3).map(([projectName, minutes], index) => (
              <div key={projectName} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PROJECT_COLORS[index % PROJECT_COLORS.length] }}
                />
                <span className="text-xs text-[#666666] truncate max-w-[100px]">
                  {projectName.length > 15 ? projectName.substring(0, 15) + '...' : projectName}
                </span>
              </div>
            ))}
            {topProjects.length > 3 && (
              <span className="text-xs text-[#888888]">
                +{topProjects.length - 3} {language === 'es' ? 'más' : 'more'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasData && (
        <p className="text-sm text-[#888888] italic">
          {language === 'es' ? 'No hay registros en este período' : 'No entries in this period'}
        </p>
      )}
    </>
  );
}
