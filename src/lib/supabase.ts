import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Public values only (project URL + publishable key), read from .env.
// Never put a secret key here: everything in EXPO_PUBLIC_ ends up in the app.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

/**
 * Returns the shared Supabase client, or null when .env is not filled in
 * (so a missing config shows a clean error instead of crashing the app).
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabasePublishableKey) return null;
  if (!client) {
    // No user sign-in yet, so there is no session to store or refresh.
    client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
