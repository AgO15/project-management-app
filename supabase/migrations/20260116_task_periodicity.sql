-- Migration: Add periodicity to tasks for If-Then implementation intentions
-- This allows users to configure if a task is one-time, daily, weekly, etc.

-- Add periodicity column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS periodicity TEXT DEFAULT 'one_time'
CHECK (periodicity IN ('one_time', 'daily', 'weekly', 'custom'));

-- Add comment for documentation
COMMENT ON COLUMN tasks.periodicity IS 'Frequency of the If-Then intention: one_time, daily, weekly, or custom';
