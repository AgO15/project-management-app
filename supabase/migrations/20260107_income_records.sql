-- Migration: Create income_records table for finance tracking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS income_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Amounts
  amount_bs DECIMAL(15, 2) NOT NULL,
  rate_bcv DECIMAL(10, 4) NOT NULL,
  rate_binance DECIMAL(10, 4) NOT NULL,
  amount_usd_bcv DECIMAL(15, 2) NOT NULL,
  amount_usd_binance DECIMAL(15, 2) NOT NULL,
  
  -- Allocations stored as JSONB array
  -- Format: [{ "category": "Ahorros", "percentage": 30, "amount_usd": 5.94, "notes": "" }]
  allocations JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Optional notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_income_records_user_id ON income_records(user_id);
CREATE INDEX IF NOT EXISTS idx_income_records_project_id ON income_records(project_id);
CREATE INDEX IF NOT EXISTS idx_income_records_period ON income_records(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_income_records_created_at ON income_records(created_at DESC);

-- Enable RLS
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own records
CREATE POLICY "Users can view own income records" ON income_records
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own records
CREATE POLICY "Users can insert own income records" ON income_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own records
CREATE POLICY "Users can update own income records" ON income_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own records
CREATE POLICY "Users can delete own income records" ON income_records
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_income_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_income_records_updated_at
  BEFORE UPDATE ON income_records
  FOR EACH ROW
  EXECUTE FUNCTION update_income_records_updated_at();
