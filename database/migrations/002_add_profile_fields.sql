-- Add additional profile fields for job seekers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS test_results JSONB;

-- Drop the existing name column and recreate it as a generated column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS name;
ALTER TABLE public.profiles ADD COLUMN name TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND first_name <> '' AND last_name <> '' THEN 
            first_name || ' ' || last_name
        WHEN first_name IS NOT NULL AND first_name <> '' THEN 
            first_name
        WHEN last_name IS NOT NULL AND last_name <> '' THEN 
            last_name
        ELSE ''
    END
) STORED;

-- Add INSERT policy for profile creation
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the trigger function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, first_name, last_name, company_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'job-seeker'),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'companyName', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;