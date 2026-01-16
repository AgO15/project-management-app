// File: lib/types.ts
// ============================================================================
// Sistema de Gestión Jerárquica Basado en Neurociencia Cognitiva
// ============================================================================
// Base Teórica:
//   - Nivel MACRO: Áreas de Vida (Teoría Jerárquica de Metas - Carver & Scheier)
//   - Nivel MESO: Proyectos con Ciclos (Modelo Transteórico - Prochaska & DiClemente)
//   - Nivel MICRO: Tareas Si-Entonces (Intenciones de Implementación - Gollwitzer)
// ============================================================================

// ============================================================================
// TIPOS FUNDAMENTALES
// ============================================================================

/**
 * Estados del ciclo de vida de un proyecto según el modelo metabólico de energía.
 * Basado en el Modelo Transteórico adaptado a gestión de proyectos.
 */
export type ProjectCycleState = 'introduction' | 'growth' | 'stabilization' | 'pause';

// ============================================================================
// NIVEL MACRO: ÁREAS DE VIDA
// ============================================================================

/**
 * Área de vida del usuario - Nivel superior de la jerarquía de metas.
 * Representa dominios fundamentales que dan coherencia vertical a los proyectos.
 */
export interface Area {
  id: string;
  name: string;
  vision_statement: string | null; // Declaración de visión a largo plazo
  user_id: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// NIVEL MICRO: NOTAS
// ============================================================================

/**
 * Define el tipo para una sola Nota.
 */
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

// ============================================================================
// NIVEL MICRO: TAREAS (Intenciones de Implementación)
// ============================================================================

/**
 * Define el tipo para la periodicidad de tareas Si-Entonces.
 */
export type TaskPeriodicity = 'one_time' | 'daily' | 'weekly' | 'custom';

/**
 * Define el tipo para una Tarea con soporte para Intenciones de Implementación.
 * El patrón "Si-Entonces" de Gollwitzer aumenta significativamente la probabilidad
 * de ejecución al vincular señales contextuales con acciones específicas.
 */
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
  notes: Note[]; // Conexión con notas relacionadas

  // Intenciones de Implementación (Gollwitzer)
  trigger_if: string | null;        // Condición disparadora: "Si..."
  action_then: string | null;       // Acción específica: "Entonces..."
  is_micro_objective: boolean;      // Indica si es un micro-objetivo discreto
  periodicity: TaskPeriodicity;     // Periodicidad de la intención
}

// ============================================================================
// NIVEL MESO: PROYECTOS (Gestión Metabólica de Energía)
// ============================================================================

/**
 * Define el tipo para un Proyecto con soporte para gestión jerárquica y metabólica.
 * Los proyectos pertenecen a Áreas (coherencia vertical) y tienen un ciclo de vida
 * que determina la inversión de energía apropiada.
 */
export interface Project {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  color: string | null;
  status: 'active' | 'paused' | 'not_started' | 'completed' | 'archived';
  user_id: string;

  // Coherencia Vertical (Carver & Scheier)
  area_id: string | null;           // Área de vida a la que pertenece

  // Gestión Metabólica (Modelo Transteórico adaptado)
  cycle_state: ProjectCycleState;   // Estado actual del ciclo de vida

  // Representación Mental y Criterios de Salida
  representation: string | null;    // Representación visual/mental del resultado deseado
  exit_criteria: string | null;     // Criterios objetivos para considerar el proyecto completado
}

// ============================================================================
// ENTRADAS DE TIEMPO
// ============================================================================

/**
 * Define el tipo para una Entrada de Tiempo.
 */
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
    projects?: {
      name: string;
    } | null;
  } | null;
}

// ============================================================================
// TIPOS AUXILIARES PARA UI
// ============================================================================

/**
 * Proyecto con su área relacionada (para vistas que necesitan mostrar la jerarquía)
 */
export interface ProjectWithArea extends Project {
  area?: Area | null;
}

/**
 * Tarea con su proyecto relacionado (para vistas contextuales)
 */
export interface TaskWithProject extends Task {
  project?: Project | null;
}

/**
 * Área con sus proyectos relacionados (para vistas de árbol jerárquico)
 */
export interface AreaWithProjects extends Area {
  projects?: Project[];
}

// ============================================================================
// GESTIÓN FINANCIERA
// ============================================================================

/**
 * Categoría de asignación para distribución de ingresos.
 * Permite dividir el ingreso en diferentes categorías con porcentajes.
 */
export interface IncomeAllocation {
  category: string;           // e.g., "Ahorros", "Gastos Fijos", "Inversión"
  percentage: number;         // 0-100
  amount_usd: number;         // Calculated from Binance rate
  notes?: string;
}

/**
 * Registro de ingreso con cálculos automáticos.
 * Almacena información de salario/ingreso con tasas de cambio y distribución.
 */
export interface IncomeRecord {
  id: string;
  user_id: string;
  project_id: string | null;
  period_start: string;
  period_end: string;
  amount_bs: number;
  rate_bcv: number;
  rate_binance: number;
  amount_usd_bcv: number;     // Auto-calculated: amount_bs / rate_bcv
  amount_usd_binance: number; // Auto-calculated: amount_bs / rate_binance
  allocations: IncomeAllocation[];
  notes: string | null;
  created_at: string;
  updated_at?: string;
}