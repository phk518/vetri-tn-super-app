-- src/db/migrations.sql
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'citizen',
  department_code TEXT,
  office_code TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create SLA policies table
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id SERIAL PRIMARY KEY,
  service_type TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_until DATE,
  duration_minutes INTEGER NOT NULL,
  UNIQUE(service_type, effective_from)
);

-- 3. Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  applicant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  sla_duration_minutes INTEGER NOT NULL,
  sla_deadline TIMESTAMPTZ NOT NULL,
  breached_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  last_status_change TIMESTAMPTZ DEFAULT now(),
  service_payload JSONB DEFAULT '{}'::jsonb,
  assigned_officer_id UUID REFERENCES public.profiles(id),
  department_code TEXT NOT NULL,
  office_code TEXT,
  deleted_at TIMESTAMPTZ
);

-- 4. Create application events table
CREATE TABLE IF NOT EXISTS public.application_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE RESTRICT,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  actor_type TEXT DEFAULT 'system',
  changed_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_sla_deadline ON public.applications(sla_deadline) 
  WHERE status IN ('NEW', 'UNDER_REVIEW');
CREATE INDEX IF NOT EXISTS idx_applications_department ON public.applications(department_code);

-- 6. Append-only trigger for events
CREATE OR REPLACE FUNCTION public.prevent_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'application_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_delete_events
  BEFORE UPDATE OR DELETE ON public.application_events
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_event_mutation();

-- 7. Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'citizen'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Citizens can view own applications"
  ON public.applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Citizens can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update applications"
  ON public.applications FOR UPDATE
  USING (true);

CREATE POLICY "Users can view own events"
  ON public.application_events FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM public.applications WHERE user_id = auth.uid()
    )
  );

-- 10. Seed SLA policies (Demo mode - short durations)
INSERT INTO public.sla_policies (service_type, effective_from, duration_minutes)
VALUES 
  ('DRIVING_LICENSE', '2024-01-01', 180),  -- 3 minutes for demo
  ('RATION_CARD', '2024-01-01', 120),      -- 2 minutes for demo
  ('BIRTH_REGISTRATION', '2024-01-01', 90), -- 1.5 minutes for demo
  ('RPM_ALERT', '2024-01-01', 60);         -- 1 minute for demo

-- For production, use realistic durations:
-- ('DRIVING_LICENSE', '2024-01-01', 43200),  -- 30 days
-- ('RATION_CARD', '2024-01-01', 21600),     -- 15 days
-- ('BIRTH_REGISTRATION', '2024-01-01', 10080), -- 7 days
-- ('RPM_ALERT', '2024-01-01', 120);         -- 2 hours