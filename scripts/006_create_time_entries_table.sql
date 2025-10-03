-- Create time entries table for time tracking
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- calculated field for completed entries
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time entries
CREATE POLICY "time_entries_select_own" ON public.time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "time_entries_insert_own" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "time_entries_update_own" ON public.time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "time_entries_delete_own" ON public.time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Function to calculate duration when end_time is set
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate duration
DROP TRIGGER IF EXISTS calculate_duration_trigger ON public.time_entries;
CREATE TRIGGER calculate_duration_trigger
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_duration();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON public.time_entries(start_time);
