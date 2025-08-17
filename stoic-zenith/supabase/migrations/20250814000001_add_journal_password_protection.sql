-- Add journal password protection fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS journal_password_hash TEXT,
ADD COLUMN IF NOT EXISTS journal_password_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS journal_password_updated_at TIMESTAMP WITH TIME ZONE;

-- Update the updated_at trigger to include new password fields
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET
        email = NEW.email,
        full_name = NEW.raw_user_meta_data->>'full_name',
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update journal password timestamp
CREATE OR REPLACE FUNCTION public.update_journal_password_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.journal_password_hash IS DISTINCT FROM NEW.journal_password_hash THEN
        NEW.journal_password_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update journal_password_updated_at
DROP TRIGGER IF EXISTS update_journal_password_timestamp ON public.profiles;
CREATE TRIGGER update_journal_password_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_journal_password_timestamp();