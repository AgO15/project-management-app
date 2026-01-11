-- Create checklist_items table for task checklists
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_items
CREATE POLICY "checklist_items_select_own" ON public.checklist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "checklist_items_insert_own" ON public.checklist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checklist_items_update_own" ON public.checklist_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "checklist_items_delete_own" ON public.checklist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON public.checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_user_id ON public.checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_position ON public.checklist_items(position);
