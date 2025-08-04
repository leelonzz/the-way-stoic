-- Fix journal_entries table - Run this in Supabase SQL Editor
-- This script ensures the journal_entries table exists with the correct structure

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    entry_date DATE NOT NULL,
    entry_type TEXT DEFAULT 'general' CHECK (entry_type IN ('morning', 'evening', 'general')),
    excited_about TEXT,
    make_today_great TEXT,
    must_not_do TEXT,
    grateful_for TEXT,
    biggest_wins TEXT[],
    tensions TEXT[],
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
    tags TEXT[],
    rich_text_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add rich_text_content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'journal_entries' 
                   AND column_name = 'rich_text_content') THEN
        ALTER TABLE public.journal_entries ADD COLUMN rich_text_content JSONB;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'journal_entries' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.journal_entries ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;

-- Create policies for journal_entries
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON public.journal_entries(entry_type);

-- Create or replace function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON public.journal_entries;
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON public.journal_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'journal_entries' 
AND table_schema = 'public'
ORDER BY ordinal_position;
