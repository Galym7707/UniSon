# Profiles Table Schema Analysis

## Current Table Schema

Based on the migration files, the `profiles` table has the following structure:

### Base Table (001_create_profiles_table_and_trigger.sql)
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    role TEXT,
    name TEXT, -- REMOVED in 002_add_profile_fields.sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Additional Fields (002_add_profile_fields.sql)
```sql
-- Core personal info
first_name TEXT
last_name TEXT
company_name TEXT

-- Job seeker specific fields  
title TEXT
summary TEXT
experience TEXT
skills TEXT
resume_url TEXT

-- Auto-generated computed column
name TEXT GENERATED ALWAYS AS (
    CASE 
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND first_name <> '' AND last_name <> '' THEN 
            first_name || ' ' || last_name
        WHEN first_name IS NOT NULL AND first_name <> '' THEN 
            first_name
        WHEN last_name IS NOT NULL AND last_name <> '' THEN 
            last_name
        ELSE ''
    END
) STORED
```

### Assessment Data (003_add_test_results_column.sql)
```sql
test_results JSONB DEFAULT NULL
```

### Profile Image (004_add_profile_image_url.sql)
```sql
profile_image_url TEXT
```

### Skills Structure (006_add_skills_structure.sql)
```sql
programming_skills JSONB DEFAULT '[]'::jsonb
language_skills JSONB DEFAULT '[]'::jsonb
```

## Complete Current Schema

```sql
public.profiles (
    -- Primary identification
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    role TEXT,
    
    -- Personal information
    first_name TEXT,
    last_name TEXT,
    name TEXT GENERATED ALWAYS AS (...) STORED, -- Auto-computed from first_name + last_name
    profile_image_url TEXT,
    
    -- Company information
    company_name TEXT,
    
    -- Job seeker profile fields
    title TEXT,
    summary TEXT,
    experience TEXT,
    skills TEXT, -- Legacy text field
    resume_url TEXT,
    
    -- Assessment data
    test_results JSONB DEFAULT NULL,
    
    -- Structured skills data
    programming_skills JSONB DEFAULT '[]'::jsonb,
    language_skills JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Constraints and Indexes

### Row Level Security (RLS)
- RLS is enabled on the table
- Policies exist for SELECT, UPDATE, and INSERT operations

### Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### Indexes
```sql
-- GIN index for test_results JSON queries
CREATE INDEX idx_profiles_test_results_gin 
ON public.profiles USING GIN (test_results);

-- Partial index for profiles with test results
CREATE INDEX idx_profiles_has_test_results 
ON public.profiles (id) 
WHERE test_results IS NOT NULL;
```

### Check Constraints
```sql
-- Validates test_results JSON structure when not null
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
```

## Code vs Schema Comparison

### server-utils.ts Profile Creation
The `createUserAccount` function inserts these fields:
```typescript
await supabaseAdmin.from("profiles").insert({
  id: userId,                    // ✓ Matches schema (UUID, PRIMARY KEY)
  role: data.role,              // ✓ Matches schema (TEXT)
  first_name: data.first_name,  // ✓ Matches schema (TEXT)
  last_name: data.last_name,    // ✓ Matches schema (TEXT)
  company_name: data.companyName, // ✓ Matches schema (TEXT)
  email: data.email,            // ✓ Matches schema (TEXT)
})
```

### Trigger Function Profile Creation
The database trigger `handle_new_user()` inserts:
```sql
INSERT INTO public.profiles (id, email, role, first_name, last_name, company_name)
VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'companyName', '')
);
```

## Potential Issues Identified

### 1. Duplicate Profile Creation
- The database trigger `on_auth_user_created` automatically creates a profile record
- The `server-utils.ts` code also manually creates a profile record
- **ISSUE**: This could cause duplicate key violations or race conditions

### 2. Role Default Mismatch
- Database trigger defaults role to 'employee' 
- Code expects 'job-seeker' based on SignupData interface
- **ISSUE**: Inconsistent role handling

### 3. Field Mapping Issues
- Trigger uses `companyName` from user metadata
- Code uses `company_name` column name
- **ISSUE**: Potential field name mismatches

### 4. Missing NULL Constraints
- Most fields allow NULL values but code doesn't handle this
- No NOT NULL constraints on required fields like email, role
- **ISSUE**: Data integrity concerns

### 5. Skills Data Structure
- Table has both legacy `skills TEXT` and new structured JSONB fields
- Code doesn't populate the structured skills fields during signup
- **ISSUE**: Inconsistent skills data handling

## Recommendations

1. **Remove Duplicate Profile Creation**: Either use the trigger OR manual insertion, not both
2. **Add NOT NULL Constraints**: For required fields like email, role, first_name, last_name
3. **Fix Role Default**: Align trigger default with expected roles
4. **Standardize Field Names**: Ensure consistent naming between code and database
5. **Handle Generated Columns**: Ensure code doesn't try to insert into computed `name` field
6. **Update Skills Handling**: Populate structured skills fields during profile creation