-- Add structured skills columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS programming_skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_skills JSONB DEFAULT '[]'::jsonb;

-- Add comments to describe the structure
COMMENT ON COLUMN public.profiles.programming_skills IS 'Array of objects: [{id: string, language: string, proficiency: "beginner"|"intermediate"|"advanced"|"expert"}]';
COMMENT ON COLUMN public.profiles.language_skills IS 'Array of objects: [{id: string, language: string, proficiency: "basic"|"conversational"|"fluent"|"native"}]';