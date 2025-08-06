-- Check auth setup and diagnose user session issues
-- Run this in Supabase SQL Editor

-- 1. Check if auth schema exists and has users
DO $$
BEGIN
    RAISE NOTICE 'Checking auth schema and users...';
END $$;

-- Check auth.users table (this might fail if we don't have access)
SELECT 
    'auth.users table check' as check_type,
    COUNT(*) as user_count
FROM auth.users;

-- 2. Check saved_quotes table structure
SELECT 
    'saved_quotes schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'saved_quotes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check foreign key constraints
SELECT 
    'foreign_key_constraints' as check_type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'saved_quotes';

-- 4. Check RLS policies on saved_quotes
SELECT 
    'rls_policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'saved_quotes';

-- 5. Check if RLS is enabled
SELECT 
    'rls_status' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'saved_quotes';

-- 6. Test auth.uid() function
SELECT 
    'auth_uid_test' as check_type,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No authenticated user'
        ELSE 'User authenticated'
    END as auth_status;

-- 7. Check if there are any saved_quotes records
SELECT 
    'saved_quotes_data' as check_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM public.saved_quotes;

-- 8. Check quotes table
SELECT 
    'quotes_table' as check_type,
    COUNT(*) as total_quotes
FROM public.quotes;

-- 9. If we can access auth.users, show some stats
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    BEGIN
        SELECT COUNT(*) INTO user_count FROM auth.users;
        RAISE NOTICE 'Auth users count: %', user_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Cannot access auth.users table (this is normal for security)';
    END;
END $$;

-- 10. Test creating a sample record (this will help identify the exact issue)
-- Note: This will only work if you're authenticated
DO $$
DECLARE
    current_user_id UUID;
    test_result TEXT;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'No authenticated user - cannot test insert';
    ELSE
        RAISE NOTICE 'Current authenticated user ID: %', current_user_id;
        
        -- Try to insert a test record
        BEGIN
            INSERT INTO public.saved_quotes (
                user_id,
                quote_text,
                author,
                source,
                tags,
                personal_note,
                is_favorite,
                saved_at
            ) VALUES (
                current_user_id,
                'Test quote for debugging',
                'Debug Author',
                'Debug Source',
                ARRAY['debug', 'test'],
                'This is a test insert to check foreign key constraints',
                false,
                NOW()
            );
            
            RAISE NOTICE 'Test insert successful - foreign key constraint is working';
            
            -- Clean up the test record
            DELETE FROM public.saved_quotes 
            WHERE user_id = current_user_id 
            AND quote_text = 'Test quote for debugging';
            
            RAISE NOTICE 'Test record cleaned up';
            
        EXCEPTION WHEN foreign_key_violation THEN
            RAISE NOTICE 'Foreign key violation: User ID % does not exist in auth.users', current_user_id;
        WHEN OTHERS THEN
            RAISE NOTICE 'Other error during test insert: %', SQLERRM;
        END;
    END IF;
END $$;
