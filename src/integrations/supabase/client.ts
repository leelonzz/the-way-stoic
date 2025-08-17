// Browser-side Supabase client with SSR support
import { getSupabaseBrowserClient } from './browser';

// Export the browser client instance
// This will handle cookies properly for auth persistence
export const supabase = getSupabaseBrowserClient();