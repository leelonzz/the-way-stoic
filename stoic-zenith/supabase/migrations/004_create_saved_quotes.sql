-- Create saved_quotes table for user bookmarks
CREATE TABLE IF NOT EXISTS public.saved_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    quote_id UUID REFERENCES public.quotes ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, quote_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own saved quotes" ON public.saved_quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved quotes" ON public.saved_quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved quotes" ON public.saved_quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved quotes" ON public.saved_quotes
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_saved_quotes_user_id ON public.saved_quotes(user_id);
CREATE INDEX idx_saved_quotes_quote_id ON public.saved_quotes(quote_id);