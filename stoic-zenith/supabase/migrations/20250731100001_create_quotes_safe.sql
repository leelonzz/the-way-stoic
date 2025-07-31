-- Create quotes table for storing stoic quotes (safe version)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    source TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to quotes (drop if exists first)
DROP POLICY IF EXISTS "Anyone can view quotes" ON public.quotes;
CREATE POLICY "Anyone can view quotes" ON public.quotes
    FOR SELECT USING (true);

-- Insert initial stoic quotes (only if table is empty)
INSERT INTO public.quotes (text, author, source, category)
SELECT * FROM (VALUES
    ('You have power over your mind - not outside events. Realize this, and you will find strength.', 'Marcus Aurelius', 'Meditations', 'mindset'),
    ('Wealth consists in not having great possessions, but in having few wants.', 'Epictetus', 'Discourses', 'wealth'),
    ('We suffer more often in imagination than in reality.', 'Seneca', 'Letters from a Stoic', 'suffering'),
    ('The best revenge is not to be like your enemy.', 'Marcus Aurelius', 'Meditations', 'virtue'),
    ('It''s not what happens to you, but how you react to it that matters.', 'Epictetus', 'Discourses', 'perspective'),
    ('Every new beginning comes from some other beginning''s end.', 'Seneca', 'Letters from a Stoic', 'change'),
    ('You are an actor in a play, which is as the author wants it to be.', 'Epictetus', 'Enchiridion', 'acceptance'),
    ('Confine yourself to the present.', 'Marcus Aurelius', 'Meditations', 'present'),
    ('Luck is what happens when preparation meets opportunity.', 'Seneca', 'Letters from a Stoic', 'opportunity'),
    ('The mind that is not baffled is not employed.', 'Wendell Berry', 'Modern', 'growth'),
    ('Waste no more time arguing what a good man should be. Be one.', 'Marcus Aurelius', 'Meditations', 'action'),
    ('First say to yourself what you would be; and then do what you have to do.', 'Epictetus', 'Discourses', 'purpose'),
    ('Life is long if you know how to use it.', 'Seneca', 'On the Shortness of Life', 'time'),
    ('The happiness of your life depends upon the quality of your thoughts.', 'Marcus Aurelius', 'Meditations', 'happiness'),
    ('Don''t explain your philosophy. Embody it.', 'Epictetus', 'Discourses', 'wisdom'),
    ('What we do now echoes in eternity.', 'Marcus Aurelius', 'Meditations', 'legacy'),
    ('The willing, destiny guides them. The unwilling, destiny drags them.', 'Cleanthes', 'Ancient', 'destiny'),
    ('No man is free who is not master of himself.', 'Epictetus', 'Discourses', 'freedom'),
    ('Remember that very little disturbs the happy progress of our lives but our own bad habits.', 'Seneca', 'Letters from a Stoic', 'habits'),
    ('When we are no longer able to change a situation, we are challenged to change ourselves.', 'Viktor Frankl', 'Modern', 'adaptation')
) AS v(text, author, source, category)
WHERE NOT EXISTS (SELECT 1 FROM public.quotes LIMIT 1);