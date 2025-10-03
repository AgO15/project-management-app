-- Create files table (for both projects and tasks)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  type TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint to ensure file belongs to either project or task, but not both
  CONSTRAINT files_belongs_to_one CHECK (
    (project_id IS NOT NULL AND task_id IS NULL) OR 
    (project_id IS NULL AND task_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files
CREATE POLICY "files_select_own" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "files_insert_own" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "files_update_own" ON public.files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "files_delete_own" ON public.files
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_task_id ON public.files(task_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
