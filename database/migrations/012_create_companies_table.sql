-- Migration: 012_create_companies_table.sql
-- Description: Create companies table for employer profiles
-- Created: 2025-01-15

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    website TEXT,
    logo_url TEXT,
    industry TEXT,
    size TEXT,
    description TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table
-- Only authenticated users can view companies
CREATE POLICY "Authenticated users can view companies" ON public.companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only company owners can update their own company
CREATE POLICY "Owners can update their own company" ON public.companies
    FOR UPDATE USING (auth.uid() = owner_id);

-- Only company owners can delete their own company
CREATE POLICY "Owners can delete their own company" ON public.companies
    FOR DELETE USING (auth.uid() = owner_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies(name);
CREATE INDEX IF NOT EXISTS companies_industry_idx ON public.companies(industry);