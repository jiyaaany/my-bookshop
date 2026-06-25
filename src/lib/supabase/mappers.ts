/**
 * Row ↔ model mapping between Postgres (snake_case) and the app models.
 * Kept separate so the Repository stays focused on I/O.
 */

import type { Book, Quote, ReadingRecord, ReadingStatus, Tag } from '@/types/models';

export interface BookRow {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  cover_image_url: string | null;
  page_count: number | null;
  reading_status: ReadingStatus;
  rating: number | null;
  purchased_date: string | null;
  started_date: string | null;
  finished_date: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
  book_tags?: { tag_id: string }[];
}

export interface QuoteRow {
  id: string;
  book_id: string;
  text: string;
  page_number: number | null;
  created_at: string;
}

export interface RecordRow {
  id: string;
  book_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface TagRow {
  id: string;
  name: string;
}

export function bookFromRow(row: BookRow): Book {
  return {
    id: row.id,
    isbn: row.isbn ?? undefined,
    title: row.title,
    author: row.author,
    publisher: row.publisher ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    pageCount: row.page_count ?? undefined,
    readingStatus: row.reading_status,
    rating: row.rating != null ? (row.rating as Book['rating']) : undefined,
    purchasedDate: row.purchased_date ?? undefined,
    startedDate: row.started_date ?? undefined,
    finishedDate: row.finished_date ?? undefined,
    memo: row.memo ?? undefined,
    tagIds: (row.book_tags ?? []).map((t) => t.tag_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Book → books row (excludes tag relations, which live in book_tags). */
export function bookToRow(book: Book, userId: string) {
  return {
    id: book.id,
    user_id: userId,
    isbn: book.isbn ?? null,
    title: book.title,
    author: book.author,
    publisher: book.publisher ?? null,
    cover_image_url: book.coverImageUrl ?? null,
    page_count: book.pageCount ?? null,
    reading_status: book.readingStatus,
    rating: book.rating ?? null,
    purchased_date: book.purchasedDate ?? null,
    started_date: book.startedDate ?? null,
    finished_date: book.finishedDate ?? null,
    memo: book.memo ?? null,
    created_at: book.createdAt,
    updated_at: book.updatedAt,
  };
}

export const quoteFromRow = (r: QuoteRow): Quote => ({
  id: r.id,
  bookId: r.book_id,
  text: r.text,
  pageNumber: r.page_number ?? undefined,
  createdAt: r.created_at,
});

export const quoteToRow = (q: Quote, userId: string) => ({
  id: q.id,
  user_id: userId,
  book_id: q.bookId,
  text: q.text,
  page_number: q.pageNumber ?? null,
  created_at: q.createdAt,
});

export const recordFromRow = (r: RecordRow): ReadingRecord => ({
  id: r.id,
  bookId: r.book_id,
  title: r.title,
  body: r.body,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const recordToRow = (r: ReadingRecord, userId: string) => ({
  id: r.id,
  user_id: userId,
  book_id: r.bookId,
  title: r.title,
  body: r.body,
  created_at: r.createdAt,
  updated_at: r.updatedAt,
});

export const tagFromRow = (r: TagRow): Tag => ({ id: r.id, name: r.name });
