-- Create projects table for bolt.diy
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gdfvktjkmdyvpewqycpd/sql

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  files_json JSONB DEFAULT '{}',
  preview_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for demo mode without authentication)
CREATE POLICY "Allow all operations" ON public.projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant access to anon and authenticated roles
GRANT ALL ON public.projects TO anon;
GRANT ALL ON public.projects TO authenticated;
