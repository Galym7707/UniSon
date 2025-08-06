-- Test User Setup for Delete Account Testing
-- Execute these SQL commands in Supabase SQL Editor to create test users

-- 1. Create test user for basic deletion testing
-- Note: This creates the auth user; profile will be created automatically by trigger
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'test-delete-basic@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "job-seeker", "first_name": "Test", "last_name": "DeleteUser"}',
    false,
    'authenticated'
);

-- 2. Create test user with additional profile data
INSERT INTO auth.users (
    id,
    instance_id, 
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'test-delete-data@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "job-seeker", "first_name": "Test", "last_name": "WithData"}',
    false,
    'authenticated'
);

-- 3. Verify test users were created and profiles were generated
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE 'test-delete-%@example.com'
ORDER BY u.created_at DESC;

-- 4. Query to check for orphaned records after deletion testing
-- (Run this after testing to verify complete cleanup)
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users 
WHERE email LIKE 'test-delete-%@example.com'
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as count  
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email LIKE 'test-delete-%@example.com';

-- 5. Manual cleanup command (if needed)
-- DELETE FROM auth.users WHERE email LIKE 'test-delete-%@example.com';

-- 6. Test environment validation queries
-- Verify cascade deletion is properly configured
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'profiles'
    AND ccu.table_name = 'users';

-- 7. Test RLS policies are active
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE tablename = 'profiles' 
    AND schemaname = 'public';

SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
    AND schemaname = 'public';