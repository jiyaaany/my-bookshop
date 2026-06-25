/**
 * App bootstrap: hydrate the store from Supabase when a user is signed in.
 *
 * Local-first: with no Supabase config or no session, the seeded local store is
 * kept as-is. On login we pull the cloud snapshot; on logout we leave the local
 * cache untouched (a future step can clear/swap per-account caches).
 */

import { getSupabase } from '@/lib/supabase/client';
import { getSupabaseRepository } from '@/lib/supabase/repository';
import { bookshopStore, hydrate, setStatus } from '@/lib/store/bookshop-store';

export async function bootstrapBookshop(): Promise<void> {
  const repo = getSupabaseRepository();
  const client = getSupabase();
  if (!repo || !client) return; // local-only mode (no env) → keep seed

  const { data } = await client.auth.getSession();
  if (!data.session) return; // not signed in → keep local cache

  try {
    setStatus('loading');
    const snapshot = await repo.load();
    hydrate(snapshot);
  } catch (err) {
    if (__DEV__) console.warn('[bootstrap] cloud hydrate failed, staying local:', err);
    setStatus('ready');
  }
}

/** Re-hydrate whenever the auth session changes (login). Returns an unsubscribe. */
export function watchAuthChanges(): () => void {
  const client = getSupabase();
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    if (session) {
      void bootstrapBookshop();
    } else {
      setStatus('ready');
    }
  });
  return () => data.subscription.unsubscribe();
}

// re-export for convenience
export { bookshopStore };
