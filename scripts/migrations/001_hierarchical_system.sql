-- ============================================================================
-- MIGRACIÓN 001: Sistema de Gestión Jerárquica Basado en Neurociencia Cognitiva
-- ============================================================================
-- Base Teórica:
--   - Teoría Jerárquica de Metas (Carver & Scheier) → Coherencia Vertical
--   - Modelo Transteórico (Prochaska & DiClemente) → Estados Meso (Ciclo de Proyectos)
--   - Intenciones de Implementación (Gollwitzer) → Nivel Micro (Tareas Si-Entonces)
-- ============================================================================

-- 1. NIVEL MESO: Definir Estados de Ciclo para Proyectos
-- Basado en el Modelo Transteórico adaptado a gestión de proyectos
CREATE TYPE project_cycle_state AS ENUM (
    'introduction',   -- Fase inicial: exploración y definición
    'growth',         -- Fase de crecimiento activo: máxima inversión de energía
    'stabilization',  -- Fase de consolidación: mantenimiento y refinamiento
    'pause'           -- Fase de pausa: proyecto en espera o hibernación
);

COMMENT ON TYPE project_cycle_state IS 'Estados del ciclo de vida de un proyecto según el modelo metabólico de energía';

-- 2. NIVEL MACRO: Crear Tabla de Áreas de Vida
-- Representa los dominios fundamentales de la vida del usuario (Coherencia Vertical)
CREATE TABLE public.areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    vision_statement TEXT,  -- Declaración de visión a largo plazo para esta área
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuario
CREATE INDEX idx_areas_user_id ON public.areas(user_id);

-- Comentarios descriptivos
COMMENT ON TABLE public.areas IS 'Áreas de vida del usuario - Nivel Macro de la jerarquía de metas';
COMMENT ON COLUMN public.areas.vision_statement IS 'Declaración de visión a largo plazo que guía las decisiones en esta área';

-- Habilitar RLS (Row Level Security) para áreas
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias áreas
CREATE POLICY "Users can view own areas" ON public.areas
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias áreas
CREATE POLICY "Users can insert own areas" ON public.areas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias áreas
CREATE POLICY "Users can update own areas" ON public.areas
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias áreas
CREATE POLICY "Users can delete own areas" ON public.areas
    FOR DELETE USING (auth.uid() = user_id);

-- 3. NIVEL MESO: Evolucionar Tabla de Proyectos
-- Añadir campos para la gestión metabólica de energía y coherencia vertical
ALTER TABLE public.projects 
    ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cycle_state project_cycle_state DEFAULT 'pause',
    ADD COLUMN IF NOT EXISTS representation TEXT,  -- Representación mental/visual del resultado deseado
    ADD COLUMN IF NOT EXISTS exit_criteria TEXT;   -- Criterios claros para considerar el proyecto completado

-- Índice para consultas por área
CREATE INDEX IF NOT EXISTS idx_projects_area_id ON public.projects(area_id);
CREATE INDEX IF NOT EXISTS idx_projects_cycle_state ON public.projects(cycle_state);

-- Comentarios descriptivos
COMMENT ON COLUMN public.projects.area_id IS 'Área de vida a la que pertenece este proyecto (coherencia vertical)';
COMMENT ON COLUMN public.projects.cycle_state IS 'Estado actual del ciclo de vida del proyecto (gestión metabólica)';
COMMENT ON COLUMN public.projects.representation IS 'Representación mental del resultado final deseado';
COMMENT ON COLUMN public.projects.exit_criteria IS 'Criterios objetivos para determinar cuándo el proyecto está completado';

-- 4. NIVEL MICRO: Evolucionar Tabla de Tareas
-- Implementar patrón "Si-Entonces" de Gollwitzer para intenciones de implementación
ALTER TABLE public.tasks 
    ADD COLUMN IF NOT EXISTS trigger_if TEXT,           -- Condición disparadora: "Si..."
    ADD COLUMN IF NOT EXISTS action_then TEXT,          -- Acción específica: "Entonces..."
    ADD COLUMN IF NOT EXISTS is_micro_objective BOOLEAN DEFAULT true;  -- Indica si es un micro-objetivo

-- Comentarios descriptivos
COMMENT ON COLUMN public.tasks.trigger_if IS 'Condición disparadora de la intención de implementación (Si...)';
COMMENT ON COLUMN public.tasks.action_then IS 'Acción específica a ejecutar (Entonces...)';
COMMENT ON COLUMN public.tasks.is_micro_objective IS 'Indica si esta tarea representa un micro-objetivo discreto';

-- ============================================================================
-- FIN DE LA MIGRACIÓN 001
-- ============================================================================
-- Próximos pasos:
--   1. Ejecutar esta migración en el SQL Editor de Supabase
--   2. Actualizar los tipos TypeScript en lib/types.ts
--   3. Proceder con el Batch 2: Formulario de captura "Si-Entonces"
-- ============================================================================
