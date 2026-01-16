-- Migration: Add streak tracking columns to tasks table
-- Run this in Supabase SQL Editor

-- Add streak tracking columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_days JSONB DEFAULT '[]';

-- Create table to track daily completions for streak calculation
CREATE TABLE IF NOT EXISTS intention_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, completed_at)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_intention_completions_task_id ON intention_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_intention_completions_user_id ON intention_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_intention_completions_date ON intention_completions(completed_at);

-- Enable RLS
ALTER TABLE intention_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own completions" ON intention_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON intention_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions" ON intention_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to calculate and update streak when marking intention complete
CREATE OR REPLACE FUNCTION update_task_streak()
RETURNS TRIGGER AS $$
DECLARE
  consecutive_days INTEGER := 0;
  check_date DATE;
  current_best INTEGER;
BEGIN
  -- Get current best streak
  SELECT best_streak INTO current_best FROM tasks WHERE id = NEW.task_id;
  
  -- Count consecutive days backwards from today
  check_date := CURRENT_DATE;
  LOOP
    IF EXISTS (
      SELECT 1 FROM intention_completions 
      WHERE task_id = NEW.task_id 
      AND completed_at = check_date
    ) THEN
      consecutive_days := consecutive_days + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  -- Update task streak
  UPDATE tasks 
  SET 
    current_streak = consecutive_days,
    best_streak = GREATEST(COALESCE(current_best, 0), consecutive_days),
    last_completed_at = NOW()
  WHERE id = NEW.task_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_streak ON intention_completions;
CREATE TRIGGER trigger_update_streak
  AFTER INSERT ON intention_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_task_streak();
