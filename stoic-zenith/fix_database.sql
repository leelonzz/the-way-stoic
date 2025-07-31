-- Create missing tables directly
-- This script will be executed manually in Supabase SQL editor

-- 1. Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    source TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view quotes" ON public.quotes;
CREATE POLICY "Anyone can view quotes" ON public.quotes FOR SELECT USING (true);

-- Insert quotes data
INSERT INTO public.quotes (text, author, source, category) VALUES
('You have power over your mind - not outside events. Realize this, and you will find strength.', 'Marcus Aurelius', 'Meditations', 'mindset'),
('Wealth consists in not having great possessions, but in having few wants.', 'Epictetus', 'Discourses', 'wealth'),
('We suffer more often in imagination than in reality.', 'Seneca', 'Letters from a Stoic', 'suffering'),
('The best revenge is not to be like your enemy.', 'Marcus Aurelius', 'Meditations', 'virtue'),
('It''s not what happens to you, but how you react to it that matters.', 'Epictetus', 'Discourses', 'perspective'),
('Every new beginning comes from some other beginning''s end.', 'Seneca', 'Letters from a Stoic', 'change'),
('You are an actor in a play, which is as the author wants it to be.', 'Epictetus', 'Enchiridion', 'acceptance'),
('Confine yourself to the present.', 'Marcus Aurelius', 'Meditations', 'present'),
('Luck is what happens when preparation meets opportunity.', 'Seneca', 'Letters from a Stoic', 'opportunity'),
('Waste no more time arguing what a good man should be. Be one.', 'Marcus Aurelius', 'Meditations', 'action')
ON CONFLICT DO NOTHING;

-- 2. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    birth_date DATE,
    life_expectancy INTEGER DEFAULT 80,
    theme_preference TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    daily_quote_time TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 3. Create saved_quotes table
CREATE TABLE IF NOT EXISTS public.saved_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    quote_id UUID REFERENCES public.quotes ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, quote_id)
);

ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can view own saved quotes" ON public.saved_quotes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can insert own saved quotes" ON public.saved_quotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can delete own saved quotes" ON public.saved_quotes FOR DELETE USING (auth.uid() = user_id);

-- 4. Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'personal',
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'count',
    is_completed BOOLEAN DEFAULT false,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON public.user_goals;
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON public.user_goals;
CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON public.user_goals;
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);