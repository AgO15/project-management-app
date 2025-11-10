// File: components/TimeReportCard.tsx (Componente Display)

import { TimeEntry } from "@/lib/types"; // Asegúrate de que este tipo es accesible

interface TimeReportCardProps {
  timeEntries: TimeEntry[];
  reportTitle: string; 
  isLoading: boolean; 
}

// Función auxiliar para formatear minutos
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
  
  if (isLoading) {
    return (
      <>
        <div className="text-3xl font-bold mb-4">Cargando...</div>
        <p className="text-muted-foreground">Calculando datos para el rango.</p>
      </>
    );
  }

  // Calcula el tiempo total
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);

  // Agrupa tiempo por tarea
  const timeByTask = timeEntries.reduce((acc, entry) => {
    const taskTitle = entry.tasks?.title || 'Untitled Task';
    acc[taskTitle] = (acc[taskTitle] || 0) + (entry.duration_minutes || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
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
          <p className="text-muted-foreground">No time tracked en el rango seleccionado.</p>
        )}
      </div>
    </>
  );
}