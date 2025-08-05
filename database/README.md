# Database Migrations

This directory contains PostgreSQL database migrations for the Supabase project.

## Running Migrations

To apply these migrations to your Supabase database:

1. **Using Supabase CLI** (recommended):
   ```bash
   supabase db reset
   # or apply specific migration
   supabase db push
   ```

2. **Using Supabase Dashboard**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of the migration file
   - Execute the SQL

3. **Using psql or any PostgreSQL client**:
   ```bash
   psql -h your-db-host -U postgres -d your-db-name -f database/migrations/001_create_profiles_table_and_trigger.sql
   ```

## Migration: 001_create_profiles_table_and_trigger.sql

This migration creates:

1. **profiles table**: Stores user profile information with a foreign key relationship to `auth.users`
2. **Row Level Security policies**: Ensures users can only access their own profiles
3. **handle_new_user() function**: PostgreSQL trigger function that automatically creates profile records
4. **on_auth_user_created trigger**: Executes the function after every INSERT on `auth.users`

### Table Schema

```sql
public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Trigger Function Behavior

The `handle_new_user()` function extracts data from the new user's `raw_user_meta_data` JSONB column:
- **role**: Defaults to 'employee' if not provided
- **name**: Uses 'name' field, falls back to 'full_name', or empty string if neither exists

This ensures that every new user account automatically gets a corresponding profile record.