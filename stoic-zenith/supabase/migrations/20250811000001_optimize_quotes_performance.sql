-- Optimize quotes table for performance with large datasets
-- Add indexes, full-text search, and performance improvements

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_author ON public.quotes(author);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON public.quotes(category);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);

-- Add full-text search index for quotes text and author
CREATE INDEX IF NOT EXISTS idx_quotes_text_search ON public.quotes 
USING gin(to_tsvector('english', text || ' ' || author || ' ' || COALESCE(source, '')));

-- Add composite index for category + created_at (for filtered pagination)
CREATE INDEX IF NOT EXISTS idx_quotes_category_created_at ON public.quotes(category, created_at DESC);

-- Add text length index for performance optimization (to handle long quotes efficiently)
CREATE INDEX IF NOT EXISTS idx_quotes_text_length ON public.quotes(length(text));

-- Create a function for efficient quote search
CREATE OR REPLACE FUNCTION search_quotes(
  search_term TEXT,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  text TEXT,
  author TEXT,
  source TEXT,
  category TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.text,
    q.author,
    q.source,
    q.category,
    q.created_at,
    ts_rank(to_tsvector('english', q.text || ' ' || q.author || ' ' || COALESCE(q.source, '')), 
            plainto_tsquery('english', search_term)) as rank
  FROM public.quotes q
  WHERE to_tsvector('english', q.text || ' ' || q.author || ' ' || COALESCE(q.source, '')) 
        @@ plainto_tsquery('english', search_term)
  ORDER BY rank DESC, q.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function for paginated quotes by category
CREATE OR REPLACE FUNCTION get_quotes_by_category(
  category_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  text TEXT,
  author TEXT,
  source TEXT,
  category TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  IF category_filter IS NULL THEN
    RETURN QUERY
    SELECT q.id, q.text, q.author, q.source, q.category, q.created_at
    FROM public.quotes q
    ORDER BY q.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
  ELSE
    RETURN QUERY
    SELECT q.id, q.text, q.author, q.source, q.category, q.created_at
    FROM public.quotes q
    WHERE q.category = category_filter
    ORDER BY q.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get random quotes efficiently
CREATE OR REPLACE FUNCTION get_random_quotes(
  limit_count INTEGER DEFAULT 10,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  text TEXT,
  author TEXT,
  source TEXT,
  category TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  IF category_filter IS NULL THEN
    RETURN QUERY
    SELECT q.id, q.text, q.author, q.source, q.category, q.created_at
    FROM public.quotes q
    ORDER BY RANDOM()
    LIMIT limit_count;
  ELSE
    RETURN QUERY
    SELECT q.id, q.text, q.author, q.source, q.category, q.created_at
    FROM public.quotes q
    WHERE q.category = category_filter
    ORDER BY RANDOM()
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add a quotes_stats table for caching statistics
CREATE TABLE IF NOT EXISTS public.quotes_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_quotes INTEGER NOT NULL DEFAULT 0,
  categories JSONB DEFAULT '{}',
  authors JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to update quotes statistics
CREATE OR REPLACE FUNCTION update_quotes_stats()
RETURNS VOID AS $$
DECLARE
  total_count INTEGER;
  categories_data JSONB;
  authors_data JSONB;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM public.quotes;
  
  -- Get categories with counts
  SELECT jsonb_object_agg(category, count)
  INTO categories_data
  FROM (
    SELECT category, COUNT(*) as count
    FROM public.quotes
    GROUP BY category
    ORDER BY count DESC
  ) cat_counts;
  
  -- Get authors with counts
  SELECT jsonb_object_agg(author, count)
  INTO authors_data
  FROM (
    SELECT author, COUNT(*) as count
    FROM public.quotes
    GROUP BY author
    ORDER BY count DESC
    LIMIT 100  -- Limit to top 100 authors for performance
  ) author_counts;
  
  -- Update or insert stats
  INSERT INTO public.quotes_stats (total_quotes, categories, authors, last_updated)
  VALUES (total_count, categories_data, authors_data, NOW())
  ON CONFLICT (id) DO UPDATE SET
    total_quotes = EXCLUDED.total_quotes,
    categories = EXCLUDED.categories,
    authors = EXCLUDED.authors,
    last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when quotes are modified
CREATE OR REPLACE FUNCTION trigger_update_quotes_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats asynchronously to avoid blocking the main operation
  PERFORM pg_notify('update_quotes_stats', '');
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic stats updates
DROP TRIGGER IF EXISTS quotes_stats_trigger ON public.quotes;
CREATE TRIGGER quotes_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION trigger_update_quotes_stats();

-- Enable RLS on quotes_stats
ALTER TABLE public.quotes_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to quotes_stats
CREATE POLICY "Anyone can view quotes stats" ON public.quotes_stats
  FOR SELECT USING (true);

-- Initial stats update
SELECT update_quotes_stats();

-- Add helpful comments
COMMENT ON FUNCTION search_quotes IS 'Full-text search function for quotes with ranking';
COMMENT ON FUNCTION get_quotes_by_category IS 'Paginated quotes retrieval with optional category filtering';
COMMENT ON FUNCTION get_random_quotes IS 'Efficient random quote selection with optional category filtering';
COMMENT ON TABLE public.quotes_stats IS 'Cached statistics for quotes to improve dashboard performance';
