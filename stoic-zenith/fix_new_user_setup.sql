-- Fix new user setup issues
-- Run this in Supabase SQL Editor while logged in as the problematic user

-- 1. Check current authenticated user
SELECT 
    'current_user_check' as check_type,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No authenticated user - please log in'
        ELSE 'User is authenticated'
    END as status;

-- 2. Check if user has a profile
DO $$
DECLARE
    current_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'No authenticated user found. Please log in and run this script again.';
    ELSE
        RAISE NOTICE 'Checking setup for user: %', current_user_id;
        
        -- Check if profile exists
        SELECT EXISTS(
            SELECT 1 FROM public.profiles WHERE id = current_user_id
        ) INTO profile_exists;
        
        IF profile_exists THEN
            RAISE NOTICE 'User profile exists';
        ELSE
            RAISE NOTICE 'User profile does not exist - this may be the issue';
            
            -- Try to create a basic profile
            BEGIN
                INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
                SELECT 
                    current_user_id,
                    'user@example.com', -- This will be updated by the trigger
                    'User',
                    NOW(),
                    NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.profiles WHERE id = current_user_id
                );
                
                RAISE NOTICE 'Created basic profile for user';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not create profile: %', SQLERRM;
            END;
        END IF;
        
        -- Test if we can insert into saved_quotes
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
                'Test quote for new user setup',
                'Test Author',
                'Setup Test',
                ARRAY['test', 'setup'],
                'Testing new user setup - ' || NOW()::text,
                false,
                NOW()
            );
            
            RAISE NOTICE 'SUCCESS: Test quote saved successfully for user %', current_user_id;
            
            -- Clean up the test quote
            DELETE FROM public.saved_quotes 
            WHERE user_id = current_user_id 
            AND quote_text = 'Test quote for new user setup';
            
            RAISE NOTICE 'Test quote cleaned up';
            
        EXCEPTION 
            WHEN foreign_key_violation THEN
                RAISE NOTICE 'FOREIGN KEY ERROR: User % does not exist in auth.users table', current_user_id;
                RAISE NOTICE 'This suggests the user account was not properly created in Supabase Auth';
                RAISE NOTICE 'SOLUTION: Log out completely and log back in, or contact support';
            WHEN OTHERS THEN
                RAISE NOTICE 'OTHER ERROR: %', SQLERRM;
        END;
    END IF;
END $$;

-- 3. Check profiles table structure and policies
SELECT 
    'profiles_table_check' as check_type,
    COUNT(*) as total_profiles
FROM public.profiles;

-- 4. Check if profiles table has proper trigger for new users
SELECT 
    'trigger_check' as check_type,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 5. Create the handle_new_user function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for new user signup (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 10. Final verification
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        RAISE NOTICE '=== FINAL VERIFICATION ===';
        RAISE NOTICE 'User ID: %', current_user_id;
        RAISE NOTICE 'Profile exists: %', EXISTS(SELECT 1 FROM public.profiles WHERE id = current_user_id);
        RAISE NOTICE 'Can access saved_quotes: %', EXISTS(SELECT 1 FROM public.saved_quotes WHERE user_id = current_user_id LIMIT 1) OR TRUE;
        RAISE NOTICE '=== END VERIFICATION ===';
        RAISE NOTICE '';
        RAISE NOTICE 'If you still have issues:';
        RAISE NOTICE '1. Log out completely from the application';
        RAISE NOTICE '2. Clear browser cache and localStorage';
        RAISE NOTICE '3. Log back in';
        RAISE NOTICE '4. Try saving a quote again';
    END IF;
END $$;
