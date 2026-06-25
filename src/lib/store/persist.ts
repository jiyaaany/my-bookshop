/**
 * Write-through to Supabase.
 *
 * Store mutations update the local cache immediately (optimistic) and then call
 * these fire-and-forget helpers to persist to the cloud. When Supabase isn't
 * configured or the user isn't signed in, they no-op (the repository throws on
 * no-session and we swallow it) — the local change is always kept.
 *
 * Note: ids are client-generated UUIDs (see newId), so local and cloud rows
 * share the same id — no reconciliation needed on the next hydrate.
 */

import { getSupabaseRepository } from '@/lib/supabase/repository';
import type { Book, Quote, ReadingRecord, Tag } from '@/types/models';

function run(op: string, fn: (r: NonNullable<ReturnType<typeof getSupabaseRepository>>) => Promise<void>) {
  const repo = getSupabaseRepository();
  if (!repo) return; // local-only mode
  fn(repo).catch((err) => {
    if (__DEV__) console.warn(`[persist] ${op} failed (local kept):`, err?.message ?? err);
  });
}

export const persistUpsertBook = (b: Book) => run('upsertBook', (r) => r.upsertBook(b));
export const persistDeleteBook = (id: string) => run('deleteBook', (r) => r.deleteBook(id));
export const persistUpsertQuote = (q: Quote) => run('upsertQuote', (r) => r.upsertQuote(q));
export const persistDeleteQuote = (id: string) => run('deleteQuote', (r) => r.deleteQuote(id));
export const persistUpsertRecord = (r0: ReadingRecord) => run('upsertRecord', (r) => r.upsertRecord(r0));
export const persistDeleteRecord = (id: string) => run('deleteRecord', (r) => r.deleteRecord(id));
export const persistUpsertTag = (t: Tag) => run('upsertTag', (r) => r.upsertTag(t));
