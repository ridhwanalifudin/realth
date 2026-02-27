-- =====================================================
-- MIGRATION 002: Add body metrics columns to profiles
-- Run this in the Supabase SQL Editor
-- =====================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2),       -- current body weight in kg
  ADD COLUMN IF NOT EXISTS fat_percentage NUMERIC(4,1); -- body fat %
