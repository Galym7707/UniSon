-- Migration: 004_create_cities_and_countries_tables.sql
-- Description: Create countries and cities tables for location data
-- Created: 2025-01-07

BEGIN;

-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE, -- ISO country code (e.g., 'US', 'CA', 'GB')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country_id INTEGER REFERENCES public.countries(id) ON DELETE CASCADE,
    state_province TEXT, -- Optional state/province/region
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON public.cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_countries_name ON public.countries(name);
CREATE INDEX IF NOT EXISTS idx_countries_code ON public.countries(code);

-- Enable Row Level Security
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view countries" ON public.countries
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view cities" ON public.cities
    FOR SELECT USING (true);

-- Insert some sample data for testing
INSERT INTO public.countries (name, code) VALUES 
    ('United States', 'US'),
    ('Canada', 'CA'),
    ('United Kingdom', 'GB'),
    ('Germany', 'DE'),
    ('France', 'FR'),
    ('Japan', 'JP'),
    ('Australia', 'AU')
ON CONFLICT (code) DO NOTHING;

-- Insert sample cities
INSERT INTO public.cities (name, country_id, state_province) VALUES 
    ('New York', (SELECT id FROM public.countries WHERE code = 'US'), 'New York'),
    ('Los Angeles', (SELECT id FROM public.countries WHERE code = 'US'), 'California'),
    ('Chicago', (SELECT id FROM public.countries WHERE code = 'US'), 'Illinois'),
    ('Houston', (SELECT id FROM public.countries WHERE code = 'US'), 'Texas'),
    ('Toronto', (SELECT id FROM public.countries WHERE code = 'CA'), 'Ontario'),
    ('Vancouver', (SELECT id FROM public.countries WHERE code = 'CA'), 'British Columbia'),
    ('Montreal', (SELECT id FROM public.countries WHERE code = 'CA'), 'Quebec'),
    ('London', (SELECT id FROM public.countries WHERE code = 'GB'), 'England'),
    ('Manchester', (SELECT id FROM public.countries WHERE code = 'GB'), 'England'),
    ('Edinburgh', (SELECT id FROM public.countries WHERE code = 'GB'), 'Scotland'),
    ('Berlin', (SELECT id FROM public.countries WHERE code = 'DE'), 'Berlin'),
    ('Munich', (SELECT id FROM public.countries WHERE code = 'DE'), 'Bavaria'),
    ('Hamburg', (SELECT id FROM public.countries WHERE code = 'DE'), 'Hamburg'),
    ('Paris', (SELECT id FROM public.countries WHERE code = 'FR'), 'Île-de-France'),
    ('Lyon', (SELECT id FROM public.countries WHERE code = 'FR'), 'Auvergne-Rhône-Alpes'),
    ('Marseille', (SELECT id FROM public.countries WHERE code = 'FR'), 'Provence-Alpes-Côte d''Azur'),
    ('Tokyo', (SELECT id FROM public.countries WHERE code = 'JP'), 'Tokyo'),
    ('Osaka', (SELECT id FROM public.countries WHERE code = 'JP'), 'Osaka'),
    ('Kyoto', (SELECT id FROM public.countries WHERE code = 'JP'), 'Kyoto'),
    ('Sydney', (SELECT id FROM public.countries WHERE code = 'AU'), 'New South Wales'),
    ('Melbourne', (SELECT id FROM public.countries WHERE code = 'AU'), 'Victoria'),
    ('Brisbane', (SELECT id FROM public.countries WHERE code = 'AU'), 'Queensland');

COMMIT;

-- Rollback script (commented out for reference)
-- To rollback this migration, run the following commands:
/*
BEGIN;

-- Drop tables in reverse order due to foreign key constraints
DROP TABLE IF EXISTS public.cities;
DROP TABLE IF EXISTS public.countries;

COMMIT;
*/