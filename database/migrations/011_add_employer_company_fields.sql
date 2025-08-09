-- Add additional company-related fields for employer profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (
    company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+')
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS founded_year INTEGER CHECK (
    founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headquarters TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add indexes for better query performance on employer searches
CREATE INDEX IF NOT EXISTS profiles_company_name_idx ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS profiles_industry_idx ON public.profiles(industry);
CREATE INDEX IF NOT EXISTS profiles_company_size_idx ON public.profiles(company_size);
CREATE INDEX IF NOT EXISTS profiles_role_company_idx ON public.profiles(role, company_name) WHERE role = 'employer';

-- Update the trigger function to include new company fields from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        role, 
        first_name, 
        last_name, 
        company_name,
        industry,
        website
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'job-seeker'),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'companyName', ''),
        COALESCE(NEW.raw_user_meta_data->>'industry', ''),
        COALESCE(NEW.raw_user_meta_data->>'website', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;