// File: lib/types.ts

// 1. Define el tipo para una sola Nota
export interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  content: string;
  project_id: string;
  task_id: string | null;
  user_id: string;
}

// 2. Define el tipo para una Tarea, incluyendo un array de Notas
export interface Task {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_id: string;
  user_id: string;
  notes: Note[]; // <-- Esta es la línea clave que conecta las notas con las tareas
}

// 3. Define el tipo para un Proyecto
export interface Project {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  color: string | null;
  status: 'active' | 'paused' | 'not_started' | 'completed' | 'archived';
  user_id: string;
}

// 4. Define el tipo para una Entrada de Tiempo
export interface TimeEntry {
  id: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  task_id: string;
  user_id: string;
  tasks?: { // Opcional, para obtener el título de la tarea relacionada
    title: string;
  } | null;
}