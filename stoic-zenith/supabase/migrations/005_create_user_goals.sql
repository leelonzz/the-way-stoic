-- Create user_goals table for personal stoic goals tracking
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'personal' CHECK (category IN ('personal', 'virtue', 'wisdom', 'discipline', 'mindfulness')),
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'count',
    is_completed BOOLEAN DEFAULT false,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own goals" ON public.user_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.user_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.user_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle goal updates
CREATE OR REPLACE FUNCTION public.handle_goal_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Auto-complete goal if current_value reaches target_value
    IF NEW.target_value IS NOT NULL AND NEW.current_value >= NEW.target_value AND OLD.is_completed = false THEN
        NEW.is_completed = true;
        NEW.completed_at = NOW();
    END IF;
    
    -- Reset completed_at if goal is marked as incomplete
    IF NEW.is_completed = false AND OLD.is_completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic updates
DROP TRIGGER IF EXISTS on_goal_updated ON public.user_goals;
CREATE TRIGGER on_goal_updated
    BEFORE UPDATE ON public.user_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_goal_update();

-- Create index for performance
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_category ON public.user_goals(category);
CREATE INDEX idx_user_goals_completed ON public.user_goals(is_completed);