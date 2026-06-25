/**
 * The app's local cache + client state.
 *
 * This is the single source of truth the UI reads from. On startup it is seeded
 * with sample data; the persistence seam (Repository ↔ SyncEngine) will later
 * hydrate it from local storage and reconcile with Supabase. See:
 *   - src/lib/db/repository.ts   (local CRUD contract)
 *   - src/lib/sync/index.ts      (cloud sync contract)
 */

import { createStore, useStore } from '@/lib/store/create-store';
import { SEED, SEED_TAGS } from '@/lib/db/seed';
import type { Book, Quote, ReadingRecord, Tag } from '@/types/models';

export type ThemePreference = 'system' | 'light' | 'dark';
export type SortOrder = 'recent' | 'title' | 'rating';

export interface Preferences {
  /** 연간 독서 목표 (completed books per year). */
  yearlyGoal: number;
  defaultSort: SortOrder;
  theme: ThemePreference;
}

export interface BookshopState {
  books: Book[];
  quotes: Quote[];
  records: ReadingRecord[];
  tags: Tag[];
  preferences: Preferences;
  /** Hydration/sync status for loading & empty states. */
  status: 'idle' | 'loading' | 'ready';
}

const initialState: BookshopState = {
  books: SEED.books,
  quotes: SEED.quotes,
  records: SEED.records,
  tags: SEED_TAGS,
  preferences: { yearlyGoal: 30, defaultSort: 'recent', theme: 'system' },
  status: 'ready',
};

export const bookshopStore = createStore<BookshopState>(initialState);

// ── Actions ─────────────────────────────────────────────────────

export function setPreferences(patch: Partial<Preferences>) {
  bookshopStore.setState((s) => ({ preferences: { ...s.preferences, ...patch } }));
}

export function setYearlyGoal(goal: number) {
  setPreferences({ yearlyGoal: Math.max(1, Math.round(goal)) });
}

// ── Hooks ───────────────────────────────────────────────────────

export const useBooks = () => useStore(bookshopStore, (s) => s.books);
export const useQuotes = () => useStore(bookshopStore, (s) => s.quotes);
export const useRecords = () => useStore(bookshopStore, (s) => s.records);
export const useTags = () => useStore(bookshopStore, (s) => s.tags);
export const usePreferences = () => useStore(bookshopStore, (s) => s.preferences);
export const useStatus = () => useStore(bookshopStore, (s) => s.status);
