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

// ── Helpers ─────────────────────────────────────────────────────

let idCounter = 0;
/** Local id for optimistic creates (replaced by server uuid on sync). */
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

const nowIso = () => new Date().toISOString();

// ── Preferences ─────────────────────────────────────────────────

export function setPreferences(patch: Partial<Preferences>) {
  bookshopStore.setState((s) => ({ preferences: { ...s.preferences, ...patch } }));
}

export function setYearlyGoal(goal: number) {
  setPreferences({ yearlyGoal: Math.max(1, Math.round(goal)) });
}

// ── Book actions ────────────────────────────────────────────────

export function setBookStatus(id: string, status: BookshopState['books'][number]['readingStatus']) {
  bookshopStore.setState((s) => ({
    books: s.books.map((b) => {
      if (b.id !== id) return b;
      const patch: Partial<Book> = { readingStatus: status, updatedAt: nowIso() };
      if (status === 'READING' && !b.startedDate) patch.startedDate = nowIso();
      if (status === 'DONE' && !b.finishedDate) patch.finishedDate = nowIso();
      return { ...b, ...patch };
    }),
  }));
}

export function deleteBook(id: string) {
  bookshopStore.setState((s) => ({
    books: s.books.filter((b) => b.id !== id),
    quotes: s.quotes.filter((q) => q.bookId !== id),
    records: s.records.filter((r) => r.bookId !== id),
  }));
}

export interface NewBookInput {
  title: string;
  author: string;
  publisher?: string;
  pageCount?: number;
  isbn?: string;
  coverImageUrl?: string;
  readingStatus: Book['readingStatus'];
  tagIds: string[];
}

export function addBook(input: NewBookInput): string {
  const id = newId('book');
  const at = nowIso();
  const book: Book = {
    id,
    title: input.title.trim(),
    author: input.author.trim(),
    publisher: input.publisher?.trim() || undefined,
    pageCount: input.pageCount,
    isbn: input.isbn?.trim() || undefined,
    coverImageUrl: input.coverImageUrl,
    readingStatus: input.readingStatus,
    tagIds: input.tagIds,
    startedDate: input.readingStatus === 'READING' ? at : undefined,
    finishedDate: input.readingStatus === 'DONE' ? at : undefined,
    createdAt: at,
    updatedAt: at,
  };
  bookshopStore.setState((s) => ({ books: [book, ...s.books] }));
  return id;
}

/** Find tags by name (case-insensitive) or create them; returns their ids. */
export function ensureTags(names: string[]): string[] {
  const ids: string[] = [];
  bookshopStore.setState((s) => {
    const tags = [...s.tags];
    for (const raw of names) {
      const name = raw.trim();
      if (!name) continue;
      const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        ids.push(existing.id);
      } else {
        const tag = { id: newId('tag'), name };
        tags.push(tag);
        ids.push(tag.id);
      }
    }
    return { tags };
  });
  return ids;
}

// ── Quote actions ───────────────────────────────────────────────

export function addQuote(bookId: string, text: string, pageNumber?: number): string {
  const id = newId('quote');
  const quote: Quote = { id, bookId, text: text.trim(), pageNumber, createdAt: nowIso() };
  bookshopStore.setState((s) => ({ quotes: [quote, ...s.quotes] }));
  return id;
}

export function updateQuote(id: string, patch: { text?: string; pageNumber?: number }) {
  bookshopStore.setState((s) => ({
    quotes: s.quotes.map((q) =>
      q.id === id
        ? { ...q, ...patch, text: patch.text != null ? patch.text.trim() : q.text }
        : q,
    ),
  }));
}

export function deleteQuote(id: string) {
  bookshopStore.setState((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }));
}

// ── Record actions ──────────────────────────────────────────────

export function addRecord(bookId: string, title: string, body: string): string {
  const id = newId('record');
  const at = nowIso();
  const record: ReadingRecord = { id, bookId, title: title.trim(), body, createdAt: at, updatedAt: at };
  bookshopStore.setState((s) => ({ records: [record, ...s.records] }));
  return id;
}

export function updateRecord(id: string, patch: { title?: string; body?: string }) {
  bookshopStore.setState((s) => ({
    records: s.records.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r)),
  }));
}

export function deleteRecord(id: string) {
  bookshopStore.setState((s) => ({ records: s.records.filter((r) => r.id !== id) }));
}

// ── Hooks ───────────────────────────────────────────────────────

export const useBooks = () => useStore(bookshopStore, (s) => s.books);
export const useQuotes = () => useStore(bookshopStore, (s) => s.quotes);
export const useRecords = () => useStore(bookshopStore, (s) => s.records);
export const useTags = () => useStore(bookshopStore, (s) => s.tags);
export const usePreferences = () => useStore(bookshopStore, (s) => s.preferences);
export const useStatus = () => useStore(bookshopStore, (s) => s.status);

export const useBook = (id: string | undefined) =>
  useStore(bookshopStore, (s) => s.books.find((b) => b.id === id));
export const useQuotesFor = (bookId: string | undefined) =>
  useStore(bookshopStore, (s) => s.quotes.filter((q) => q.bookId === bookId));
export const useRecordsFor = (bookId: string | undefined) =>
  useStore(bookshopStore, (s) => s.records.filter((r) => r.bookId === bookId));
export const useTagsByIds = (ids: string[]) =>
  useStore(bookshopStore, (s) => s.tags.filter((t) => ids.includes(t.id)));
export const useQuote = (id: string | undefined) =>
  useStore(bookshopStore, (s) => s.quotes.find((q) => q.id === id));
export const useRecord = (id: string | undefined) =>
  useStore(bookshopStore, (s) => s.records.find((r) => r.id === id));
