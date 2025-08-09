# Database Migration: Job Seed Data

This document explains how to execute the database migration to populate the jobs table with comprehensive seed data.

## Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up
2. **Environment Variables**: Create a `.env.local` file with your Supabase credentials
3. **Database Tables**: Ensure the `jobs` table exists in your database

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project dashboard:
- **Project URL**: Settings → API → Project URL
- **Service Role Key**: Settings → API → Project API keys → service_role (secret key)

## Running the Migration

Execute the migration using one of these methods:

### Option 1: Using npm script (recommended)
```bash
pnpm run migrate
```

### Option 2: Direct execution
```bash
npx tsx execute-migration.ts
```

## What the Migration Does

The migration script will:

1. **Add new columns** to the jobs table if they don't exist:
   - `company_logo_url` - Company logo URLs
   - `required_skills` - Array of required technical skills
   - `nice_to_have_skills` - Array of preferred skills
   - `experience_level` - Entry, mid, senior, or executive level
   - `remote_work_option` - Boolean for remote work availability
   - `benefits` - Array of job benefits
   - `psychological_traits` - Array of desired personality traits
   - `industry` - Industry category
   - `department` - Department within company
   - `job_requirements` - Detailed job requirements
   - `responsibilities` - Job responsibilities description
   - `company_size` - Company size category

2. **Insert comprehensive seed data** with 50+ realistic job postings including:
   - Technology companies (Software Engineers, DevOps, Data Scientists)
   - Healthcare organizations (Healthcare Software Engineers, Clinical Data Managers)
   - Financial services (Quantitative Developers, Risk Analysts)
   - Marketing agencies (Digital Marketing Managers, Content Specialists)
   - Manufacturing companies (Systems Engineers, Supply Chain Analysts)
   - International positions (Germany, UK, Canada)

3. **Verify data integrity** by:
   - Checking that all required columns have data
   - Testing basic filtering queries (remote work, experience level, salary, skills)
   - Confirming the data is accessible for the job search API

## Expected Output

When successful, you should see output similar to:

```
✅ Jobs table exists
✅ ALTER statement executed successfully
✅ Inserted batch 1: 5 jobs
✅ Migration completed! Inserted 5 jobs.

📊 Found 5 recent jobs in the database

🔍 Sample job data:
1. Senior Software Engineer at TechNova Inc.
   📍 Location: San Francisco, United States
   🏠 Remote: Yes
   💼 Experience: senior
   💰 Salary: $150,000 - $220,000
   🛠️ Skills: JavaScript, React, Node.js, PostgreSQL, AWS, Docker

✅ All required columns are present with data
📈 Total jobs in database: 5

🧪 Testing job search filtering queries...
✅ Remote jobs query: Found 3 remote positions
✅ Experience level query: Found 2 senior positions
✅ Salary filter query: Found 4 high-salary positions
✅ Skills search query: Found 2 JavaScript positions

🎉 Migration verification complete!
```

## Troubleshooting

### Common Issues:

1. **Missing Environment Variables**
   ```
   ❌ Missing required environment variables
   ```
   **Solution**: Create `.env.local` file with correct Supabase credentials

2. **Jobs Table Doesn't Exist**
   ```
   ❌ Jobs table does not exist
   ```
   **Solution**: Run the table creation migrations first (e.g., `004_create_jobs_table.sql`)

3. **Permission Errors**
   ```
   Error: insufficient privileges
   ```
   **Solution**: Ensure you're using the `service_role` key, not the `anon` key

4. **Network/Connection Issues**
   ```
   Error: fetch failed
   ```
   **Solution**: Check your internet connection and Supabase project URL

## Verification

After running the migration, you can verify the data was inserted correctly by:

1. **Check the Supabase dashboard**: Go to Table Editor → jobs table
2. **Run test queries** in the SQL editor:
   ```sql
   -- Check total job count
   SELECT COUNT(*) FROM jobs;
   
   -- Check remote jobs
   SELECT title, company, remote_work_option FROM jobs WHERE remote_work_option = true;
   
   -- Check skills data
   SELECT title, required_skills FROM jobs WHERE required_skills IS NOT NULL LIMIT 5;
   ```

3. **Test the job search API** (if implemented) to ensure filtering works correctly

## Data Structure

Each job record includes:
- **Basic Info**: title, description, company, location, salary
- **Classification**: industry, department, company size, employment type
- **Requirements**: experience level, required skills, job requirements
- **Benefits**: benefits array, remote work option
- **Matching**: psychological traits for personality-based matching
- **Rich Content**: company logos, detailed responsibilities

This comprehensive dataset enables advanced job search and matching functionality.