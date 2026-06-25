/**
 * Supabase client.
 *
 * Backend decision: Supabase (Postgres + Auth + Storage) — fits the relational
 * model (Book/Quote/Record/Tag) and Row-Level Security for single-account data
 * isolation. Free tier is fine for development; a launched service moves to Pro
 * (no project pausing + daily backups).
 *
 * SECRETS: only the anon (publishable) key lives in the client — it is safe to
 * ship because RLS enforces per-user access. The service-role key and the book
 * API keys (Aladin/Kakao) NEVER touch the client; they live in the edge
 * function (supabase/functions/book-lookup). See .env.example.
 */

// URL/structuredClone polyfills required by supabase-js on React Native.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/**
 * Returns the Supabase client, or null if env vars are not configured yet.
 * Callers should treat a null client as "running in local-only mode".
 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!url || !anonKey) {
    if (__DEV__) {
      console.warn(
        '[supabase] EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY not set — running local-only. ' +
          'Copy .env.example to .env to enable cloud sync.',
      );
    }
    return null;
  }
  client = createClient(url, anonKey, {
    auth: {
      // React Native: persist session in AsyncStorage; no URL session detection.
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export const isSupabaseConfigured = () => Boolean(url && anonKey);
