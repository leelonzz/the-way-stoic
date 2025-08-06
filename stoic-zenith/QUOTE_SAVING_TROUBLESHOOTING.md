# Quote Saving Issue - Troubleshooting Guide

## Problem
Users are unable to save quotes and see an "Error: Failed to save quote" message.

## Root Cause
The issue is caused by a mismatch between the database schema and the application code expectations for the `saved_quotes` table.

## Solution

### Step 1: Fix Database Schema
The `saved_quotes` table needs to be updated to include additional columns that the application expects.

**Option A: Run the migration script (Recommended)**
1. Navigate to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `fix_saved_quotes_schema.sql`
4. Run the script

**Option B: Apply the migration file**
If you have Supabase CLI set up:
```bash
cd stoic-zenith
supabase db push
```

### Step 2: Verify the Fix
After applying the database changes:

1. **Check the database schema:**
   - Go to Supabase Dashboard → Table Editor → saved_quotes
   - Verify these columns exist:
     - `id`, `user_id`, `quote_id`, `notes`, `created_at` (original columns)
     - `quote_text`, `author`, `source`, `tags`, `personal_note`, `is_favorite`, `saved_at`, `collection_name`, `date_saved`, `updated_at` (new columns)

2. **Test quote saving:**
   - Try saving a quote in the application
   - You should now see success messages instead of errors

### Step 3: Code Changes Made
The following improvements were made to the codebase:

1. **Enhanced Error Handling:**
   - Quote cards now show error toasts when save operations fail
   - Users will see specific error messages instead of silent failures

2. **Database Schema Fix:**
   - Created migration to add missing columns to `saved_quotes` table
   - Updated the table to store quote data directly instead of just references

## Technical Details

### Original Schema Issue
The migration files created a `saved_quotes` table with this schema:
```sql
CREATE TABLE saved_quotes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    quote_id UUID REFERENCES quotes,
    notes TEXT,
    created_at TIMESTAMP
);
```

### Expected Schema
But the application code expected this richer schema:
```sql
CREATE TABLE saved_quotes (
    id UUID PRIMARY KEY,
    user_id UUID,
    quote_id UUID,
    notes TEXT,
    created_at TIMESTAMP,
    quote_text TEXT NOT NULL,
    author TEXT NOT NULL,
    source TEXT,
    tags TEXT[],
    personal_note TEXT,
    is_favorite BOOLEAN,
    saved_at TIMESTAMP,
    collection_name TEXT,
    date_saved TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Files Modified
1. `src/hooks/useQuotes.ts` - Fixed saveQuote function to use correct column names
2. `src/components/quotes/DailyStoicWisdom.tsx` - Added error handling to quote cards
3. `src/components/quotes/QuoteCard.tsx` - Added error handling to quote cards
4. `supabase/migrations/20250806000001_update_saved_quotes_schema.sql` - New migration
5. `fix_saved_quotes_schema.sql` - Manual fix script

## Testing
After applying the fix:

1. **Test saving a new quote:**
   - Click the bookmark icon on any quote
   - Should see "Quote saved" success message
   - Quote should appear in your saved quotes

2. **Test error scenarios:**
   - Try saving the same quote twice
   - Should see "Quote already saved" error message

3. **Test removing saved quotes:**
   - Click the bookmark icon on a saved quote
   - Should see "Quote removed" success message

## Prevention
To prevent similar issues in the future:

1. **Keep TypeScript types in sync with database schema**
2. **Test database operations thoroughly after schema changes**
3. **Use proper error handling in all database operations**
4. **Consider using database-first development with automatic type generation**

## Support
If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase connection is working
3. Ensure you're logged in when trying to save quotes
4. Check that RLS policies allow the current user to insert into saved_quotes
