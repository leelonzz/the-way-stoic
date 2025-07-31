-- Create saved_quotes table for user bookmarks (safe version)
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

-- Create policies (drop if exists first)
DROP POLICY IF EXISTS "Users can view own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can view own saved quotes" ON public.saved_quotes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can insert own saved quotes" ON public.saved_quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can update own saved quotes" ON public.saved_quotes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved quotes" ON public.saved_quotes;
CREATE POLICY "Users can delete own saved quotes" ON public.saved_quotes
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_saved_quotes_user_id ON public.saved_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_quote_id ON public.saved_quotes(quote_id);