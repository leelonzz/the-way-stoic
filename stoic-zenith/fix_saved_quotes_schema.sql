-- Fix saved_quotes table schema to match application expectations
-- Run this script in your Supabase SQL Editor

-- Add missing columns to saved_quotes table
ALTER TABLE public.saved_quotes 
ADD COLUMN IF NOT EXISTS quote_text TEXT,
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS personal_note TEXT,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
ADD COLUMN IF NOT EXISTS collection_name TEXT,
ADD COLUMN IF NOT EXISTS date_saved TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Populate the new columns from existing quote_id references
UPDATE public.saved_quotes 
SET 
    quote_text = q.text,
    author = q.author,
    source = q.source,
    tags = COALESCE(q.mood_tags, '{}'),
    saved_at = COALESCE(saved_at, created_at),
    date_saved = COALESCE(date_saved, created_at)
FROM public.quotes q 
WHERE public.saved_quotes.quote_id = q.id 
AND (public.saved_quotes.quote_text IS NULL OR public.saved_quotes.author IS NULL);

-- Make required columns NOT NULL
ALTER TABLE public.saved_quotes 
ALTER COLUMN quote_text SET NOT NULL,
ALTER COLUMN author SET NOT NULL;

-- Create indexes for performance
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

-- Verify the schema is correct
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'saved_quotes' 
ORDER BY ordinal_position;
