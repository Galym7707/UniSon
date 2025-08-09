-- Drop existing jobs table if it exists to ensure clean schema
DROP TABLE IF EXISTS public.jobs CASCADE;

-- Create the standardized jobs table with UUID primary keys and required fields
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    remote_work_option TEXT NOT NULL DEFAULT 'no' CHECK (remote_work_option IN ('yes', 'no', 'hybrid')),
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    salary_min INTEGER,
    salary_max INTEGER,
    employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
CREATE INDEX IF NOT EXISTS jobs_experience_level_idx ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS jobs_remote_work_option_idx ON public.jobs(remote_work_option);
CREATE INDEX IF NOT EXISTS jobs_salary_range_idx ON public.jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS jobs_posted_at_idx ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_title_description_idx ON public.jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS jobs_required_skills_idx ON public.jobs USING gin(required_skills);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data to demonstrate the new schema
INSERT INTO public.jobs (
    employer_id, 
    title, 
    company, 
    description, 
    country, 
    city, 
    remote_work_option, 
    required_skills, 
    salary_min, 
    salary_max, 
    employment_type, 
    experience_level
) VALUES 
    (
        (SELECT id FROM auth.users LIMIT 1), -- Use first available user as employer
        'Senior Software Engineer',
        'TechCorp',
        'Build scalable web applications using React and Node.js. Work with a distributed team on cutting-edge projects.',
        'United States',
        'San Francisco',
        'hybrid',
        '["JavaScript", "React", "Node.js", "TypeScript", "AWS"]'::jsonb,
        120000,
        180000,
        'full-time',
        'senior'
    ),
    (
        (SELECT id FROM auth.users LIMIT 1), -- Use first available user as employer
        'Frontend Developer',
        'WebStudio',
        'Create beautiful user interfaces with modern JavaScript frameworks. Experience with React, Vue, or Angular required.',
        'United States',
        'New York',
        'yes',
        '["React", "Vue.js", "Angular", "CSS", "HTML"]'::jsonb,
        80000,
        120000,
        'full-time',
        'mid'
    ),
    (
        (SELECT id FROM auth.users LIMIT 1), -- Use first available user as employer
        'Junior Developer',
        'StartupXYZ',
        'Entry-level position for recent graduates. Training provided in full-stack development.',
        'United States',
        'Austin',
        'no',
        '["HTML", "CSS", "JavaScript", "Git"]'::jsonb,
        60000,
        80000,
        'full-time',
        'entry'
    )
ON CONFLICT DO NOTHING;