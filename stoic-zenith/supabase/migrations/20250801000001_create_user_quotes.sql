-- Create user_quotes table for user-created custom quotes
CREATE TABLE IF NOT EXISTS public.user_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    author TEXT DEFAULT 'Me',
    source TEXT,
    category TEXT DEFAULT 'personal',
    mood_tags TEXT[],
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for user_quotes
CREATE POLICY "Users can view own quotes and public quotes" ON public.user_quotes
    FOR SELECT USING (
        auth.uid() = user_id OR is_private = false
    );

CREATE POLICY "Users can insert own quotes" ON public.user_quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON public.user_quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON public.user_quotes
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_quotes_user_id ON public.user_quotes(user_id);
CREATE INDEX idx_user_quotes_category ON public.user_quotes(category);
CREATE INDEX idx_user_quotes_mood_tags ON public.user_quotes USING GIN(mood_tags);
CREATE INDEX idx_user_quotes_is_private ON public.user_quotes(is_private);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_quotes_updated_at 
    BEFORE UPDATE ON public.user_quotes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();