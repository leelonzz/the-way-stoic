-- Complete fix for quote saving issues
-- Run this script in your Supabase SQL Editor

-- 1. First, let's check the current schema of saved_quotes
DO $$
BEGIN
    RAISE NOTICE 'Checking current saved_quotes table schema...';
END $$;

-- 2. Ensure the saved_quotes table exists with the correct extended schema
CREATE TABLE IF NOT EXISTS public.saved_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    quote_text TEXT NOT NULL,
    author TEXT NOT NULL,
    source TEXT,
    tags TEXT[],
    personal_note TEXT,
    is_favorite BOOLEAN DEFAULT false,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    collection_name TEXT,
    date_saved TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
    -- Add quote_text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'quote_text') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN quote_text TEXT;
        RAISE NOTICE 'Added quote_text column';
    END IF;
    
    -- Add author column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'author') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN author TEXT;
        RAISE NOTICE 'Added author column';
    END IF;
    
    -- Add source column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'source') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN source TEXT;
        RAISE NOTICE 'Added source column';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'tags') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN tags TEXT[];
        RAISE NOTICE 'Added tags column';
    END IF;
    
    -- Add personal_note column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'personal_note') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN personal_note TEXT;
        RAISE NOTICE 'Added personal_note column';
    END IF;
    
    -- Add is_favorite column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'is_favorite') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN is_favorite BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_favorite column';
    END IF;
    
    -- Add saved_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'saved_at') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Added saved_at column';
    END IF;
    
    -- Add collection_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'collection_name') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN collection_name TEXT;
        RAISE NOTICE 'Added collection_name column';
    END IF;
    
    -- Add date_saved column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'date_saved') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN date_saved TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added date_saved column';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- 4. Populate missing data from quotes table if quote_id column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'quote_id') THEN
        -- Update records that have quote_id but missing quote_text/author
        UPDATE public.saved_quotes 
        SET 
            quote_text = COALESCE(quote_text, q.text),
            author = COALESCE(author, q.author),
            source = COALESCE(source, q.source),
            tags = COALESCE(tags, q.mood_tags, '{}'),
            saved_at = COALESCE(saved_at, created_at),
            date_saved = COALESCE(date_saved, created_at)
        FROM public.quotes q 
        WHERE public.saved_quotes.quote_id = q.id 
        AND (public.saved_quotes.quote_text IS NULL OR public.saved_quotes.author IS NULL);
        
        RAISE NOTICE 'Populated missing data from quotes table';
    END IF;
END $$;

-- 5. Make required columns NOT NULL after populating them
ALTER TABLE public.saved_quotes ALTER COLUMN quote_text SET NOT NULL;
ALTER TABLE public.saved_quotes ALTER COLUMN author SET NOT NULL;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;

-- 7. Create or update RLS policies
DROP POLICY IF EXISTS "Users can view own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can view own saved quotes" ON public.saved_quotes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can insert own saved quotes" ON public.saved_quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can update own saved quotes" ON public.saved_quotes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can delete own saved quotes" ON public.saved_quotes
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_quotes_user_id ON public.saved_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_quote_text ON public.saved_quotes(quote_text);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_author ON public.saved_quotes(author);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_tags ON public.saved_quotes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_is_favorite ON public.saved_quotes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_saved_at ON public.saved_quotes(saved_at);

-- 9. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_saved_quotes_updated_at_trigger ON public.saved_quotes;
CREATE TRIGGER update_saved_quotes_updated_at_trigger
    BEFORE UPDATE ON public.saved_quotes
    FOR EACH ROW 
    EXECUTE FUNCTION update_saved_quotes_updated_at();

-- 11. Verify the final schema
DO $$
BEGIN
    RAISE NOTICE 'Final saved_quotes table schema:';
END $$;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'saved_quotes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Quote saving fix completed successfully!';
    RAISE NOTICE 'You can now test saving quotes in the application.';
END $$;
