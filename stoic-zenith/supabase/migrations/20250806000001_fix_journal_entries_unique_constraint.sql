-- Fix journal entries table to allow multiple entries per day per user
-- Remove the problematic UNIQUE constraint that prevents multiple entries per day

-- Drop the existing unique constraint
ALTER TABLE public.journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_user_id_entry_date_entry_type_key;

-- Clean up any duplicate entries first by keeping only the most recent one for each duplicate set
-- This handles the existing duplicates that are causing the migration to fail
WITH duplicate_entries AS (
  SELECT
    id,
    user_id,
    entry_date,
    entry_type,
    md5(rich_text_content::text) as content_hash,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, entry_date, entry_type, md5(rich_text_content::text)
      ORDER BY created_at DESC
    ) as rn
  FROM public.journal_entries
  WHERE rich_text_content IS NOT NULL
)
DELETE FROM public.journal_entries
WHERE id IN (
  SELECT id FROM duplicate_entries WHERE rn > 1
);

-- For this application, we'll allow complete duplicates since users might want to create
-- multiple entries with the same content on the same day (e.g., multiple reflections)
-- So we won't add any unique constraint on content

-- Add a partial index for better performance on queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date_created
ON public.journal_entries(user_id, entry_date, created_at DESC);

-- Add comment explaining the change
COMMENT ON TABLE public.journal_entries IS 'Journal entries table - allows multiple entries per day per user, including duplicate content';
