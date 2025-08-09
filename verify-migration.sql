-- Migration verification queries for 010_standardize_jobs_table_schema.sql

-- 1. Check if all required columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND column_name IN ('country', 'city', 'remote_work_option', 'required_skills', 'employment_type', 'experience_level', 'salary_min', 'salary_max')
ORDER BY column_name;

-- 2. Count total jobs in the table
SELECT COUNT(*) as total_jobs FROM public.jobs;

-- 3. Check remote work distribution
SELECT 
    remote_work_option,
    COUNT(*) as job_count
FROM public.jobs 
GROUP BY remote_work_option;

-- 4. Check employment type distribution
SELECT 
    employment_type,
    COUNT(*) as job_count
FROM public.jobs 
GROUP BY employment_type;

-- 5. Check experience level distribution
SELECT 
    experience_level,
    COUNT(*) as job_count
FROM public.jobs 
GROUP BY experience_level;

-- 6. Check salary range distribution
SELECT 
    CASE 
        WHEN salary_min IS NULL AND salary_max IS NULL THEN 'No salary info'
        WHEN salary_min IS NOT NULL AND salary_max IS NOT NULL THEN 'Full range'
        ELSE 'Partial range'
    END as salary_status,
    COUNT(*) as job_count,
    AVG(salary_min) as avg_min_salary,
    AVG(salary_max) as avg_max_salary
FROM public.jobs 
GROUP BY 
    CASE 
        WHEN salary_min IS NULL AND salary_max IS NULL THEN 'No salary info'
        WHEN salary_min IS NOT NULL AND salary_max IS NOT NULL THEN 'Full range'
        ELSE 'Partial range'
    END;

-- 7. Check geographic diversity
SELECT 
    country,
    COUNT(*) as job_count
FROM public.jobs 
GROUP BY country
ORDER BY job_count DESC;

-- 8. Check skills data (first 5 jobs)
SELECT 
    title,
    company,
    city,
    country,
    remote_work_option,
    employment_type,
    experience_level,
    salary_min,
    salary_max,
    required_skills
FROM public.jobs 
WHERE required_skills IS NOT NULL
ORDER BY created_at
LIMIT 5;

-- 9. Verify indexes were created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'jobs' 
ORDER BY indexname;

-- 10. Check table constraints
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'jobs' 
  AND tc.constraint_type IN ('CHECK', 'FOREIGN KEY')
ORDER BY constraint_type, constraint_name;