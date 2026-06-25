/**
 * App bootstrap: hydrate the store from Supabase when a user is signed in.
 *
 * Local-first: with no Supabase config or no session, the seeded local store is
 * kept as-is. On login we pull the cloud snapshot; on logout we leave the local
 * cache untouched (a future step can clear/swap per-account caches).
 */

import { getSupabase } from '@/lib/supabase/client';
import { getSupabaseRepository } from '@/lib/supabase/repository';
import { bookshopStore, hydrate, setError, setStatus } from '@/lib/store/bookshop-store';

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
    // Signed in but the cloud snapshot failed to load — surface it instead of
    // silently showing the stale local cache as if it were the user's data.
    if (__DEV__) console.warn('[bootstrap] cloud hydrate failed:', err);
    setError('책장을 불러오지 못했어요. 네트워크 상태를 확인해 주세요.');
  }
}

/** Retry the cloud hydrate after an error (wired to the error-state CTA). */
export async function retryBootstrap(): Promise<void> {
  await bootstrapBookshop();
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
