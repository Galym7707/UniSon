-- Create candidate_profiles table to store analyzed profile data
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    extracted_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
    resume_text TEXT,
    analysis_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one profile per candidate
    CONSTRAINT candidate_profiles_candidate_id_unique UNIQUE (candidate_id)
);

-- Enable Row Level Security
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for candidate_profiles table
-- Users can view their own candidate profile
CREATE POLICY "Users can view their own candidate profile" ON public.candidate_profiles
    FOR SELECT USING (auth.uid() = candidate_id);

-- Users can insert their own candidate profile
CREATE POLICY "Users can insert their own candidate profile" ON public.candidate_profiles
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Users can update their own candidate profile
CREATE POLICY "Users can update their own candidate profile" ON public.candidate_profiles
    FOR UPDATE USING (auth.uid() = candidate_id);

-- Users can delete their own candidate profile
CREATE POLICY "Users can delete their own candidate profile" ON public.candidate_profiles
    FOR DELETE USING (auth.uid() = candidate_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS candidate_profiles_candidate_id_idx ON public.candidate_profiles(candidate_id);
CREATE INDEX IF NOT EXISTS candidate_profiles_experience_level_idx ON public.candidate_profiles(experience_level);
CREATE INDEX IF NOT EXISTS candidate_profiles_extracted_skills_idx ON public.candidate_profiles USING gin(extracted_skills);
CREATE INDEX IF NOT EXISTS candidate_profiles_created_at_idx ON public.candidate_profiles(created_at DESC);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_candidate_profiles_updated_at ON public.candidate_profiles;
CREATE TRIGGER update_candidate_profiles_updated_at
    BEFORE UPDATE ON public.candidate_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to describe the structure
COMMENT ON TABLE public.candidate_profiles IS 'Stores analyzed resume data and extracted information for job matching';
COMMENT ON COLUMN public.candidate_profiles.extracted_skills IS 'Array of skill objects: [{skill: string, confidence: number, category?: string}]';
COMMENT ON COLUMN public.candidate_profiles.analysis_metadata IS 'Additional metadata from resume analysis: {total_experience_years?: number, industries?: string[], certifications?: string[]}';