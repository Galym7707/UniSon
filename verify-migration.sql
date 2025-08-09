-- Migration verification queries
-- Run these after executing 009_comprehensive_job_seed_data.sql

-- 1. Check if all required columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN ('country', 'city', 'remote_work_option', 'required_skills')
ORDER BY column_name;

-- 2. Count total jobs in the table
SELECT COUNT(*) as total_jobs FROM public.jobs;

-- 3. Check remote work distribution
SELECT 
    remote_work_option,
    COUNT(*) as job_count
FROM public.jobs 
GROUP BY remote_work_option;

-- 4. Check geographic diversity
SELECT 
    country,
    COUNT(*) as job_count
FROM public.jobs 
GROUP BY country
ORDER BY job_count DESC;

-- 5. Check skills data (first 5 jobs)
SELECT 
    title,
    company,
    city,
    country,
    remote_work_option,
    required_skills,
    array_length(required_skills, 1) as skills_count
FROM public.jobs 
WHERE required_skills IS NOT NULL
ORDER BY id
LIMIT 5;

-- 6. Check for jobs with specific skills
SELECT 
    title,
    company,
    required_skills
FROM public.jobs 
WHERE 'JavaScript' = ANY(required_skills)
LIMIT 3;

-- 7. Check industry distribution  
SELECT 
    industry,
    COUNT(*) as job_count
FROM public.jobs 
GROUP BY industry
ORDER BY job_count DESC;

-- 8. Verify indexes were created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'jobs' 
  AND indexname LIKE 'idx_jobs_%';