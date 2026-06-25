/**
 * Domain model for 번잡한 책방.
 *
 * Relationships:
 *   Book 1—N Quote
 *   Book 1—N ReadingRecord   (the "Record" entity; renamed to avoid clashing
 *                             with TypeScript's built-in `Record<K, V>` utility)
 *   Book N—M Tag             (via Book.tagIds)
 *
 * Dates are ISO-8601 strings (`new Date().toISOString()`) for trivial JSON
 * (de)serialization across the local store ↔ Supabase sync boundary.
 */

export type ReadingStatus = 'WANT' | 'READING' | 'DONE';

/** 0–5; whole stars in the design, but typed as number for flexibility. */
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export type ISODateString = string;

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  coverImageUrl?: string;
  pageCount?: number;
  readingStatus: ReadingStatus;
  rating?: Rating;
  purchasedDate?: ISODateString;
  startedDate?: ISODateString;
  finishedDate?: ISODateString;
  memo?: string;
  /** N—M relation to Tag. */
  tagIds: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Quote {
  id: string;
  bookId: string;
  text: string;
  pageNumber?: number;
  createdAt: ISODateString;
}

/** The "기록(Record)" entity — free-form note with title + rich body. */
export interface ReadingRecord {
  id: string;
  bookId: string;
  title: string;
  /** Rich text / markdown; may embed image references. */
  body: string;
  /**
   * Attached images. Each entry is either a Supabase Storage path
   * (`{user_id}/{record_id}/{uuid}.jpg`, resolved to a signed URL for display)
   * or, in local-only mode, a `file://` device URI. See lib/supabase/storage.
   */
  imageUrls?: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Tag {
  id: string;
  name: string;
}

// ── Display helpers ─────────────────────────────────────────────

export const READING_STATUS_ORDER: ReadingStatus[] = ['WANT', 'READING', 'DONE'];

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  WANT: '읽고 싶다',
  READING: '읽는 중',
  DONE: '완독',
};

/** Library status-filter tabs, including the "전체" pseudo-filter. */
export type StatusFilter = 'ALL' | ReadingStatus;

export const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  ALL: '전체',
  ...READING_STATUS_LABEL,
};
