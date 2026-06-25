/**
 * The app's local cache + client state.
 *
 * This is the single source of truth the UI reads from. On startup it is seeded
 * with sample data; the persistence seam (Repository ↔ SyncEngine) will later
 * hydrate it from local storage and reconcile with Supabase. See:
 *   - src/lib/db/repository.ts   (local CRUD contract)
 *   - src/lib/sync/index.ts      (cloud sync contract)
 */

import { useMemo } from 'react';

import { createStore, useStore } from '@/lib/store/create-store';
import {
  persistDeleteBook,
  persistDeleteQuote,
  persistDeleteRecord,
  persistUpsertBook,
  persistUpsertQuote,
  persistUpsertRecord,
  persistUpsertTag,
} from '@/lib/store/persist';
import { SEED, SEED_TAGS } from '@/lib/db/seed';
import { deleteRecordImages } from '@/lib/supabase/storage';
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
  /** Hydration/sync status for loading, empty & error states. */
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Human-readable reason when status === 'error' (cloud load/network failure). */
  error: string | null;
}

const initialState: BookshopState = {
  books: SEED.books,
  quotes: SEED.quotes,
  records: SEED.records,
  tags: SEED_TAGS,
  preferences: { yearlyGoal: 30, defaultSort: 'recent', theme: 'system' },
  status: 'ready',
  error: null,
};

export const bookshopStore = createStore<BookshopState>(initialState);

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Client-generated UUID for new entities, so local and Supabase rows share the
 * same id (the `*.id` columns are `uuid`). The prefix arg is ignored — kept for
 * call-site readability. (Swap for a crypto-strong source when available.)
 */
export function newId(_prefix?: string): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const nowIso = () => new Date().toISOString();

// ── Preferences ─────────────────────────────────────────────────

export function setStatus(status: BookshopState['status']) {
  // Leaving the error state clears the stored reason.
  bookshopStore.setState(status === 'error' ? { status } : { status, error: null });
}

/** Move the store into the error state with a reason (cloud load/network failure). */
export function setError(message: string) {
  bookshopStore.setState({ status: 'error', error: message });
}

/** Replace the cached collections (used after a cloud hydrate). */
export function hydrate(snapshot: {
  books: Book[];
  quotes: Quote[];
  records: ReadingRecord[];
  tags: Tag[];
}) {
  bookshopStore.setState({
    books: snapshot.books,
    quotes: snapshot.quotes,
    records: snapshot.records,
    tags: snapshot.tags,
    status: 'ready',
    error: null,
  });
}

export function setPreferences(patch: Partial<Preferences>) {
  bookshopStore.setState((s) => ({ preferences: { ...s.preferences, ...patch } }));
}

export function setYearlyGoal(goal: number) {
  setPreferences({ yearlyGoal: Math.max(1, Math.round(goal)) });
}

// ── Book actions ────────────────────────────────────────────────

export function setBookStatus(id: string, status: BookshopState['books'][number]['readingStatus']) {
  let updated: Book | undefined;
  bookshopStore.setState((s) => ({
    books: s.books.map((b) => {
      if (b.id !== id) return b;
      const patch: Partial<Book> = { readingStatus: status, updatedAt: nowIso() };
      if (status === 'READING' && !b.startedDate) patch.startedDate = nowIso();
      if (status === 'DONE' && !b.finishedDate) patch.finishedDate = nowIso();
      updated = { ...b, ...patch };
      return updated;
    }),
  }));
  if (updated) persistUpsertBook(updated);
}

export function deleteBook(id: string) {
  bookshopStore.setState((s) => ({
    books: s.books.filter((b) => b.id !== id),
    quotes: s.quotes.filter((q) => q.bookId !== id),
    records: s.records.filter((r) => r.bookId !== id),
  }));
  persistDeleteBook(id); // quotes/records cascade server-side
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
  persistUpsertBook(book);
  return id;
}

export type BookEdit = Partial<
  Pick<
    Book,
    | 'title'
    | 'author'
    | 'publisher'
    | 'pageCount'
    | 'isbn'
    | 'coverImageUrl'
    | 'readingStatus'
    | 'rating'
    | 'memo'
    | 'tagIds'
    | 'purchasedDate'
    | 'startedDate'
    | 'finishedDate'
  >
>;

export function updateBook(id: string, patch: BookEdit) {
  let updated: Book | undefined;
  bookshopStore.setState((s) => ({
    books: s.books.map((b) => {
      if (b.id !== id) return b;
      const next: Book = { ...b, ...patch, updatedAt: nowIso() };
      if (next.readingStatus === 'READING' && !next.startedDate) next.startedDate = nowIso();
      if (next.readingStatus === 'DONE' && !next.finishedDate) next.finishedDate = nowIso();
      updated = next;
      return next;
    }),
  }));
  if (updated) persistUpsertBook(updated);
}

/** Find tags by name (case-insensitive) or create them; returns their ids. */
export function ensureTags(names: string[]): string[] {
  const ids: string[] = [];
  const created: Tag[] = [];
  bookshopStore.setState((s) => {
    const tags = [...s.tags];
    for (const raw of names) {
      const name = raw.trim();
      if (!name) continue;
      const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        ids.push(existing.id);
      } else {
        const tag: Tag = { id: newId('tag'), name };
        tags.push(tag);
        created.push(tag);
        ids.push(tag.id);
      }
    }
    return { tags };
  });
  created.forEach(persistUpsertTag);
  return ids;
}

// ── Quote actions ───────────────────────────────────────────────

export function addQuote(bookId: string, text: string, pageNumber?: number): string {
  const id = newId('quote');
  const quote: Quote = { id, bookId, text: text.trim(), pageNumber, createdAt: nowIso() };
  bookshopStore.setState((s) => ({ quotes: [quote, ...s.quotes] }));
  persistUpsertQuote(quote);
  return id;
}

export function updateQuote(id: string, patch: { text?: string; pageNumber?: number }) {
  let updated: Quote | undefined;
  bookshopStore.setState((s) => ({
    quotes: s.quotes.map((q) => {
      if (q.id !== id) return q;
      updated = { ...q, ...patch, text: patch.text != null ? patch.text.trim() : q.text };
      return updated;
    }),
  }));
  if (updated) persistUpsertQuote(updated);
}

export function deleteQuote(id: string) {
  bookshopStore.setState((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }));
  persistDeleteQuote(id);
}

// ── Record actions ──────────────────────────────────────────────

export function addRecord(bookId: string, title: string, body: string, imageUrls?: string[]): string {
  const id = newId('record');
  const at = nowIso();
  const record: ReadingRecord = {
    id,
    bookId,
    title: title.trim(),
    body,
    imageUrls: imageUrls?.length ? imageUrls : undefined,
    createdAt: at,
    updatedAt: at,
  };
  bookshopStore.setState((s) => ({ records: [record, ...s.records] }));
  persistUpsertRecord(record);
  return id;
}

export function updateRecord(id: string, patch: { title?: string; body?: string; imageUrls?: string[] }) {
  let updated: ReadingRecord | undefined;
  let removedImages: string[] = [];
  bookshopStore.setState((s) => ({
    records: s.records.map((r) => {
      if (r.id !== id) return r;
      if (patch.imageUrls) {
        const next = new Set(patch.imageUrls);
        removedImages = (r.imageUrls ?? []).filter((u) => !next.has(u));
      }
      updated = {
        ...r,
        ...patch,
        imageUrls: patch.imageUrls ? (patch.imageUrls.length ? patch.imageUrls : undefined) : r.imageUrls,
        updatedAt: nowIso(),
      };
      return updated;
    }),
  }));
  if (updated) persistUpsertRecord(updated);
  if (removedImages.length) void deleteRecordImages(removedImages).catch(() => {});
}

export function deleteRecord(id: string) {
  let removed: ReadingRecord | undefined;
  bookshopStore.setState((s) => {
    removed = s.records.find((r) => r.id === id);
    return { records: s.records.filter((r) => r.id !== id) };
  });
  persistDeleteRecord(id);
  if (removed?.imageUrls?.length) void deleteRecordImages(removed.imageUrls).catch(() => {});
}

// ── Hooks ───────────────────────────────────────────────────────

export const useBooks = () => useStore(bookshopStore, (s) => s.books);
export const useQuotes = () => useStore(bookshopStore, (s) => s.quotes);
export const useRecords = () => useStore(bookshopStore, (s) => s.records);
export const useTags = () => useStore(bookshopStore, (s) => s.tags);
export const usePreferences = () => useStore(bookshopStore, (s) => s.preferences);
export const useStatus = () => useStore(bookshopStore, (s) => s.status);
export const useStoreError = () => useStore(bookshopStore, (s) => s.error);

export const useBook = (id: string | undefined) =>
  useStore(bookshopStore, (s) => s.books.find((b) => b.id === id));
export const useQuote = (id: string | undefined) =>
  useStore(bookshopStore, (s) => s.quotes.find((q) => q.id === id));
export const useRecord = (id: string | undefined) =>
  useStore(bookshopStore, (s) => s.records.find((r) => r.id === id));

// NOTE: filter/map inside a useSyncExternalStore selector returns a new array
// every render → infinite loop. Select the stable source array, then derive
// with useMemo.
export const useQuotesFor = (bookId: string | undefined) => {
  const quotes = useQuotes();
  return useMemo(() => quotes.filter((q) => q.bookId === bookId), [quotes, bookId]);
};
export const useRecordsFor = (bookId: string | undefined) => {
  const records = useRecords();
  return useMemo(() => records.filter((r) => r.bookId === bookId), [records, bookId]);
};
export const useTagsByIds = (ids: string[]) => {
  const tags = useTags();
  const key = ids.join('|');
  return useMemo(() => tags.filter((t) => ids.includes(t.id)), [tags, key]); // eslint-disable-line react-hooks/exhaustive-deps
};
