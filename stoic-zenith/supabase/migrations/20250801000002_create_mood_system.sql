-- Add mood_tags column to existing quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS mood_tags TEXT[] DEFAULT '{}';

-- Create mood_categories table for predefined moods
CREATE TABLE IF NOT EXISTS public.mood_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    icon TEXT DEFAULT 'Sparkles',
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default mood categories
INSERT INTO public.mood_categories (name, description, color, icon, keywords) VALUES
('motivational', 'Quotes to inspire action and determination', '#F59E0B', 'Zap', ARRAY['success', 'courage', 'strength', 'determination', 'action', 'achieve']),
('calming', 'Quotes for peace and tranquility', '#10B981', 'Leaf', ARRAY['peace', 'calm', 'serenity', 'tranquil', 'quiet', 'stillness']),
('reflective', 'Quotes for deep thinking and wisdom', '#8B5CF6', 'Brain', ARRAY['wisdom', 'truth', 'understanding', 'knowledge', 'think', 'reflect']),
('inspirational', 'Quotes to uplift and encourage', '#EC4899', 'Heart', ARRAY['hope', 'dream', 'inspire', 'believe', 'possibility', 'faith']),
('challenging', 'Quotes about overcoming difficulties', '#EF4444', 'Mountain', ARRAY['failure', 'adversity', 'challenge', 'overcome', 'struggle', 'perseverance']),
('philosophical', 'Deep thoughts about life and existence', '#6366F1', 'BookOpen', ARRAY['life', 'existence', 'meaning', 'purpose', 'philosophy', 'reality']),
('stoic', 'Classical stoic wisdom and principles', '#374151', 'Shield', ARRAY['stoic', 'virtue', 'discipline', 'acceptance', 'control', 'reason']);

-- Enable public read access to mood_categories
ALTER TABLE public.mood_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mood categories" ON public.mood_categories
    FOR SELECT USING (true);

-- Create index for mood_tags on quotes
CREATE INDEX IF NOT EXISTS idx_quotes_mood_tags ON public.quotes USING GIN(mood_tags);

-- Function to automatically assign mood tags based on content
CREATE OR REPLACE FUNCTION assign_mood_tags_to_quote(quote_text TEXT, quote_author TEXT DEFAULT '')
RETURNS TEXT[] AS $$
DECLARE
    mood_record RECORD;
    keyword TEXT;
    assigned_moods TEXT[] := '{}';
    search_text TEXT;
BEGIN
    -- Combine quote text and author for searching
    search_text := LOWER(quote_text || ' ' || COALESCE(quote_author, ''));
    
    -- Check each mood category
    FOR mood_record IN SELECT name, keywords FROM public.mood_categories LOOP
        -- Check if any keyword matches
        FOREACH keyword IN ARRAY mood_record.keywords LOOP
            IF search_text LIKE '%' || LOWER(keyword) || '%' THEN
                assigned_moods := array_append(assigned_moods, mood_record.name);
                EXIT; -- Exit keyword loop once we find a match for this mood
            END IF;
        END LOOP;
    END LOOP;
    
    -- Default to 'general' if no moods assigned
    IF array_length(assigned_moods, 1) IS NULL THEN
        assigned_moods := ARRAY['general'];
    END IF;
    
    RETURN assigned_moods;
END;
$$ LANGUAGE plpgsql;

-- Update existing quotes with mood tags
UPDATE public.quotes 
SET mood_tags = assign_mood_tags_to_quote(text, author)
WHERE mood_tags IS NULL OR array_length(mood_tags, 1) IS NULL;