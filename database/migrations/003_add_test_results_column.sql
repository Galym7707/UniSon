-- Migration: 003_add_test_results_column.sql
-- Description: Add test_results JSONB column to profiles table for storing assessment test data
-- Created: 2025-01-07

BEGIN;

-- Add test_results column to the profiles table
-- This column will store assessment test data in JSON format
-- Initially allowing NULL values to accommodate existing profile records
ALTER TABLE public.profiles 
ADD COLUMN test_results JSONB DEFAULT NULL;

-- Add a comment to document the column's purpose
COMMENT ON COLUMN public.profiles.test_results IS 'Stores assessment test data in JSON format including scores, completion status, and test metadata';

-- Create an index on test_results for efficient JSON queries
-- This supports queries on nested JSON properties
CREATE INDEX idx_profiles_test_results_gin 
ON public.profiles USING GIN (test_results);

-- Create a partial index for profiles that have test results
-- This optimizes queries filtering for users with completed tests
CREATE INDEX idx_profiles_has_test_results 
ON public.profiles (id) 
WHERE test_results IS NOT NULL;

-- Add a check constraint to ensure test_results follows a basic schema if provided
-- This constraint ensures the JSON has expected top-level structure when not null
ALTER TABLE public.profiles 
ADD CONSTRAINT chk_test_results_schema 
CHECK (
    test_results IS NULL 
    OR (
        test_results ? 'version' 
        AND jsonb_typeof(test_results->'version') = 'string'
        AND test_results ? 'timestamp'
        AND jsonb_typeof(test_results->'timestamp') = 'string'
    )
);

COMMIT;

-- Rollback script (commented out for reference)
-- To rollback this migration, run the following commands:
/*
BEGIN;

-- Drop the check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_test_results_schema;

-- Drop the indexes
DROP INDEX IF EXISTS idx_profiles_has_test_results;
DROP INDEX IF EXISTS idx_profiles_test_results_gin;

-- Drop the column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS test_results;

COMMIT;
*/