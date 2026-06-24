/**
 * Local persistence contract.
 *
 * The UI never talks to a repository directly today (it reads the in-memory
 * store), but this is the seam we grow into: a MemoryRepository for tests/dev,
 * an AsyncStorage/SQLite repository on device, both feeding the same store.
 */

import type { Book, Quote, ReadingRecord, Tag } from '@/types/models';

export interface BookshopSnapshot {
  books: Book[];
  quotes: Quote[];
  records: ReadingRecord[];
  tags: Tag[];
}

export interface BookshopRepository {
  load(): Promise<BookshopSnapshot>;

  upsertBook(book: Book): Promise<void>;
  deleteBook(id: string): Promise<void>;

  upsertQuote(quote: Quote): Promise<void>;
  deleteQuote(id: string): Promise<void>;

  upsertRecord(record: ReadingRecord): Promise<void>;
  deleteRecord(id: string): Promise<void>;

  upsertTag(tag: Tag): Promise<void>;
  deleteTag(id: string): Promise<void>;
}
