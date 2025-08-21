-- Create journal_prompts table for storing writing prompts
CREATE TABLE IF NOT EXISTS public.journal_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('reflection', 'creative', 'gratitude', 'goals', 'stoic', 'mindfulness')),
    genre TEXT NOT NULL CHECK (genre IN ('personal_growth', 'relationships', 'career', 'wellness', 'philosophy', 'creativity')),
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create daily_prompts table for tracking daily rotation
CREATE TABLE IF NOT EXISTS public.daily_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_date DATE NOT NULL UNIQUE,
    prompt_ids UUID[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_three_prompts CHECK (array_length(prompt_ids, 1) = 3)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.journal_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_prompts (publicly readable for all authenticated users)
CREATE POLICY "Authenticated users can view prompts" ON public.journal_prompts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for daily_prompts (publicly readable for all authenticated users)
CREATE POLICY "Authenticated users can view daily prompts" ON public.daily_prompts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_prompts_category ON public.journal_prompts(category);
CREATE INDEX IF NOT EXISTS idx_journal_prompts_genre ON public.journal_prompts(genre);
CREATE INDEX IF NOT EXISTS idx_journal_prompts_active ON public.journal_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_prompts_date ON public.daily_prompts(prompt_date);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_journal_prompts_updated_at 
    BEFORE UPDATE ON public.journal_prompts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial seed prompts
INSERT INTO public.journal_prompts (prompt_text, category, genre) VALUES
-- Reflection prompts
('What moment today made you feel most alive?', 'reflection', 'personal_growth'),
('If you could have a conversation with your past self from one year ago, what would you tell them?', 'reflection', 'personal_growth'),
('What belief about yourself are you ready to let go of?', 'reflection', 'personal_growth'),
('Describe a time when you surprised yourself with your own strength.', 'reflection', 'personal_growth'),
('What would you do if you knew you could not fail?', 'reflection', 'personal_growth'),
('What pattern in your life no longer serves you?', 'reflection', 'personal_growth'),
('How has your definition of success changed over time?', 'reflection', 'personal_growth'),
('What are you pretending not to know about yourself?', 'reflection', 'personal_growth'),

-- Gratitude prompts
('Write about someone who believed in you when you didn''t believe in yourself.', 'gratitude', 'relationships'),
('What ordinary moment from this week deserves more appreciation?', 'gratitude', 'wellness'),
('Describe a challenge that ultimately led to growth.', 'gratitude', 'personal_growth'),
('What skill or ability do you have that you often take for granted?', 'gratitude', 'personal_growth'),
('Write about a place that brings you peace and why it matters to you.', 'gratitude', 'wellness'),
('What lesson from a difficult time are you grateful for now?', 'gratitude', 'personal_growth'),
('Describe something beautiful you noticed today that others might have missed.', 'gratitude', 'wellness'),
('Who taught you something valuable without even knowing it?', 'gratitude', 'relationships'),

-- Creative prompts
('If your current mood was a weather pattern, describe the forecast.', 'creative', 'creativity'),
('Write a letter to your future self 10 years from now.', 'creative', 'personal_growth'),
('Describe your ideal day without mentioning any technology.', 'creative', 'wellness'),
('If you could add one room to your home, what would it be and why?', 'creative', 'creativity'),
('Write about a decision you made that changed everything.', 'creative', 'personal_growth'),
('Describe yourself as if you were a character in your favorite book.', 'creative', 'creativity'),
('What would you create if you had unlimited resources?', 'creative', 'creativity'),
('Write about a conversation you wish you could have.', 'creative', 'relationships'),

-- Goals prompts
('What small action could you take today that your future self will thank you for?', 'goals', 'personal_growth'),
('Describe what your life looks like when you''re living your values fully.', 'goals', 'personal_growth'),
('What skill would you love to develop and why?', 'goals', 'career'),
('How do you want to be remembered by the people you care about?', 'goals', 'relationships'),
('What would you attempt if you had all the support you needed?', 'goals', 'personal_growth'),
('Describe a goal that scares and excites you at the same time.', 'goals', 'personal_growth'),
('What legacy do you want to create through your work?', 'goals', 'career'),
('How do you want to grow as a person this year?', 'goals', 'personal_growth'),

-- Stoic/Philosophy prompts
('What is within your control today, and what must you accept?', 'stoic', 'philosophy'),
('How can you practice virtue in a challenging situation you''re facing?', 'stoic', 'philosophy'),
('What would Marcus Aurelius say about your current worries?', 'stoic', 'philosophy'),
('Describe how you can turn an obstacle into an opportunity.', 'stoic', 'philosophy'),
('What does living according to nature mean to you?', 'stoic', 'philosophy'),
('How can you practice gratitude for what you have while working toward what you want?', 'stoic', 'philosophy'),
('What wisdom would you share with someone facing your current challenges?', 'stoic', 'philosophy'),
('How can you be more present in this moment?', 'stoic', 'philosophy'),

-- Mindfulness prompts
('Describe your current physical sensations without judgment.', 'mindfulness', 'wellness'),
('What emotions are you experiencing right now and where do you feel them in your body?', 'mindfulness', 'wellness'),
('Write about something you usually do on autopilot, but with full attention.', 'mindfulness', 'wellness'),
('How can you bring more awareness to your daily routines?', 'mindfulness', 'wellness'),
('Describe the sounds, smells, and textures around you right now.', 'mindfulness', 'wellness'),
('What thoughts keep recurring in your mind, and how can you observe them without attachment?', 'mindfulness', 'wellness'),
('How does your breathing change when you pay attention to it?', 'mindfulness', 'wellness'),
('Write about a moment when you felt completely present and engaged.', 'mindfulness', 'wellness'),

-- Additional varied prompts
('What assumption about others have you recently questioned?', 'reflection', 'relationships'),
('Describe a tradition you want to start or continue.', 'creative', 'relationships'),
('What boundary do you need to set for your wellbeing?', 'goals', 'wellness'),
('How has your relationship with money evolved?', 'reflection', 'career'),
('What would you do differently if you prioritized your energy over your time?', 'goals', 'wellness'),
('Write about a book, movie, or song that changed your perspective.', 'creative', 'creativity'),
('What does abundance look like in your life?', 'gratitude', 'wellness'),
('How do you want to challenge yourself this month?', 'goals', 'personal_growth'),
('What wisdom from your culture or family do you want to preserve?', 'reflection', 'relationships'),
('Describe your relationship with change and uncertainty.', 'stoic', 'philosophy'),
('What creative project has been calling to you?', 'creative', 'creativity'),
('How do you recognize when you need rest versus when you need stimulation?', 'mindfulness', 'wellness'),
('What role does forgiveness play in your life right now?', 'reflection', 'relationships'),
('Describe a risk you''re glad you took.', 'gratitude', 'personal_growth'),
('What would love do in your current situation?', 'stoic', 'philosophy'),
('How has your definition of friendship evolved?', 'reflection', 'relationships'),
('What practice helps you return to yourself when you feel scattered?', 'mindfulness', 'wellness'),
('Write about a moment when you felt deeply understood.', 'gratitude', 'relationships'),
('What old story about yourself are you ready to rewrite?', 'goals', 'personal_growth'),
('How do you want to contribute to your community?', 'goals', 'relationships');