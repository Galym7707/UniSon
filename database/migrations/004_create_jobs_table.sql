-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs table
-- Anyone can view jobs (including unauthenticated users)
CREATE POLICY "Anyone can view jobs" ON public.jobs
    FOR SELECT USING (true);

-- Only employers can create jobs
CREATE POLICY "Employers can create jobs" ON public.jobs
    FOR INSERT WITH CHECK (
        auth.uid() = employer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'employer'
        )
    );

-- Employers can update their own jobs
CREATE POLICY "Employers can update their own jobs" ON public.jobs
    FOR UPDATE USING (
        auth.uid() = employer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'employer'
        )
    );

-- Employers can delete their own jobs
CREATE POLICY "Employers can delete their own jobs" ON public.jobs
    FOR DELETE USING (
        auth.uid() = employer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'employer'
        )
    );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS jobs_employer_id_idx ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS jobs_country_city_idx ON public.jobs(country, city);
CREATE INDEX IF NOT EXISTS jobs_employment_type_idx ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS jobs_salary_range_idx ON public.jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_title_description_idx ON public.jobs USING gin(to_tsvector('english', title || ' ' || description));