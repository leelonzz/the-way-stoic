-- Update saved_quotes table to match the expected schema
-- This migration adds the missing columns that the application expects

-- First, check if the table exists with the old schema and update it
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'quote_text') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN quote_text TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'author') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN author TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'source') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN source TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'tags') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN tags TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'personal_note') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN personal_note TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'is_favorite') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'saved_at') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'collection_name') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN collection_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'date_saved') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN date_saved TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_quotes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.saved_quotes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$;

-- Update existing records to populate the new columns from the referenced quotes table
-- This is only needed if there are existing records with the old schema
UPDATE public.saved_quotes 
SET 
    quote_text = q.text,
    author = q.author,
    source = q.source,
    tags = q.mood_tags,
    saved_at = COALESCE(saved_at, created_at),
    date_saved = COALESCE(date_saved, created_at)
FROM public.quotes q 
WHERE public.saved_quotes.quote_id = q.id 
AND (public.saved_quotes.quote_text IS NULL OR public.saved_quotes.author IS NULL);

-- Make required columns NOT NULL after populating them
ALTER TABLE public.saved_quotes ALTER COLUMN quote_text SET NOT NULL;
ALTER TABLE public.saved_quotes ALTER COLUMN author SET NOT NULL;

-- Create indexes for performance on new columns
CREATE INDEX IF NOT EXISTS idx_saved_quotes_quote_text ON public.saved_quotes(quote_text);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_author ON public.saved_quotes(author);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_tags ON public.saved_quotes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_is_favorite ON public.saved_quotes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_saved_at ON public.saved_quotes(saved_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_saved_quotes_updated_at_trigger ON public.saved_quotes;
CREATE TRIGGER update_saved_quotes_updated_at_trigger
    BEFORE UPDATE ON public.saved_quotes
    FOR EACH ROW 
    EXECUTE FUNCTION update_saved_quotes_updated_at();
