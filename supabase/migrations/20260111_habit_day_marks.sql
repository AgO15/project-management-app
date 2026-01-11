-- Create habit_day_marks table for 21-day habit tracking
CREATE TABLE IF NOT EXISTS public.habit_day_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marked_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, marked_date)  -- Solo un mark por día por tarea
);

-- Enable RLS
ALTER TABLE public.habit_day_marks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habit_day_marks
CREATE POLICY "habit_marks_select_own" ON public.habit_day_marks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "habit_marks_insert_own" ON public.habit_day_marks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_marks_delete_own" ON public.habit_day_marks
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_marks_task_id ON public.habit_day_marks(task_id);
CREATE INDEX IF NOT EXISTS idx_habit_marks_user_id ON public.habit_day_marks(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_marks_date ON public.habit_day_marks(marked_date);
