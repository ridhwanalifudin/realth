-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- Description: User profile data linked to auth.users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  height INTEGER, -- in cm
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  weight_goal NUMERIC(5,2), -- in kg
  current_vo2max_avg NUMERIC(5,2),
  fitness_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: activities
-- Description: Running activities from Strava + manual enrichment
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strava_id BIGINT UNIQUE, -- Unique constraint for caching strategy
  
  -- Display info
  display_name TEXT NOT NULL,
  
  -- Strava automatic data
  distance NUMERIC(10,2) NOT NULL, -- in meters
  moving_time INTEGER NOT NULL, -- in seconds
  elapsed_time INTEGER,
  total_elevation_gain NUMERIC(8,2),
  start_date_local TIMESTAMP WITH TIME ZONE NOT NULL,
  map_polyline TEXT,
  average_speed NUMERIC(6,3), -- in m/s
  
  -- Manual enrichment data
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  feeling_scale INTEGER CHECK (feeling_scale >= 1 AND feeling_scale <= 10),
  photo_url TEXT,
  caption TEXT,
  weight_at_time NUMERIC(5,2), -- in kg
  
  -- Analytics / calculated data
  vo2max_estimate NUMERIC(5,2),
  fitness_impact TEXT,
  is_personal_best BOOLEAN DEFAULT FALSE,
  
  -- Sync status
  is_synced BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_strava_id ON public.activities(strava_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON public.activities(start_date_local DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, start_date_local DESC);

-- =====================================================
-- TABLE: biometrics_history
-- Description: Daily/periodic logs from Smart Scale
-- =====================================================
CREATE TABLE IF NOT EXISTS public.biometrics_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight NUMERIC(5,2) NOT NULL, -- in kg
  fat_percentage NUMERIC(4,2), -- percentage
  recorded_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries for same date
  UNIQUE(user_id, recorded_at)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_biometrics_user_id ON public.biometrics_history(user_id);
CREATE INDEX IF NOT EXISTS idx_biometrics_recorded_at ON public.biometrics_history(recorded_at DESC);

-- =====================================================
-- TABLE: strava_tokens
-- Description: OAuth tokens for Strava API integration
-- =====================================================
CREATE TABLE IF NOT EXISTS public.strava_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  athlete_id BIGINT NOT NULL,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_strava_tokens_user_id ON public.strava_tokens(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strava_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies for activities table
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for biometrics_history table
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

-- Policies for strava_tokens table
CREATE POLICY "Users can view own Strava tokens"
  ON public.strava_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Strava tokens"
  ON public.strava_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Strava tokens"
  ON public.strava_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own Strava tokens"
  ON public.strava_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strava_tokens_updated_at
  BEFORE UPDATE ON public.strava_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
