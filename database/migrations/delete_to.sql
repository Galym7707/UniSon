-- Migration: delete_to.sql
-- Description: Drop integer-based duplicate tables to resolve schema conflicts
-- Created: 2025-01-07
-- Purpose: Remove integer-based jobs, cities, and countries tables that conflict with UUID/text-based schema

BEGIN;

-- Drop integer-based jobs table (with BIGINT id and foreign key references to cities/countries)
DROP TABLE IF EXISTS public.jobs CASCADE;

-- Drop cities table (with BIGINT id and country_id foreign key)
DROP TABLE IF EXISTS public.cities CASCADE;

-- Drop countries table (with BIGINT id)  
DROP TABLE IF EXISTS public.countries CASCADE;

COMMIT;

-- Note: This migration removes the integer-based schema tables created in 004_create_job_tables_with_seed_data.sql
-- The standardized UUID-based jobs table with text country/city fields from 010_standardize_jobs_table_schema.sql will remain