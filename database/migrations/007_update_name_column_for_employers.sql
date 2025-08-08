-- Update the generated name column to handle both job-seekers and employers
-- Drop the existing generated name column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS name;

-- Recreate the name column with logic for both account types
ALTER TABLE public.profiles ADD COLUMN name TEXT GENERATED ALWAYS AS (
    CASE 
        -- For employer accounts (role = 'employer'), use company_name
        WHEN role = 'employer' THEN 
            COALESCE(company_name, '')
        -- For job-seeker accounts, concatenate first_name and last_name
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND first_name <> '' AND last_name <> '' THEN 
            first_name || ' ' || last_name
        WHEN first_name IS NOT NULL AND first_name <> '' THEN 
            first_name
        WHEN last_name IS NOT NULL AND last_name <> '' THEN 
            last_name
        -- Fallback to company_name if first_name and last_name are both null/empty
        ELSE 
            COALESCE(company_name, '')
    END
) STORED;