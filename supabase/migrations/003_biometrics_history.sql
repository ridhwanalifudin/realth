-- =====================================================
-- MIGRATION 003: Biometrics History Table
-- Run this in the Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.biometrics_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight NUMERIC(5,2),           -- body weight in kg
  fat_percentage NUMERIC(4,1),   -- body fat %
  notes TEXT,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_biometrics_user_id ON public.biometrics_history(user_id);
CREATE INDEX IF NOT EXISTS idx_biometrics_recorded_at ON public.biometrics_history(recorded_at);

-- RLS
ALTER TABLE public.biometrics_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own biometrics"
  ON public.biometrics_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biometrics"
  ON public.biometrics_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own biometrics"
  ON public.biometrics_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own biometrics"
  ON public.biometrics_history FOR DELETE
  USING (auth.uid() = user_id);
