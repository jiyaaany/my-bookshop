/**
 * Supabase-backed implementation of BookshopRepository.
 *
 * Activates only when the client is configured AND a user is signed in (RLS
 * scopes every row to auth.uid()). Without a session, callers should fall back
 * to local-only mode. Pairs with supabase/schema.sql.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { BookshopRepository, BookshopSnapshot } from '@/lib/db/repository';
import { getSupabase } from '@/lib/supabase/client';
import {
  bookFromRow,
  bookToRow,
  quoteFromRow,
  quoteToRow,
  recordFromRow,
  recordToRow,
  tagFromRow,
  type BookRow,
  type QuoteRow,
  type RecordRow,
  type TagRow,
} from '@/lib/supabase/mappers';
import type { Book, Quote, ReadingRecord, Tag } from '@/types/models';

export class SupabaseRepository implements BookshopRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async userId(): Promise<string> {
    const { data } = await this.client.auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error('Not authenticated');
    return id;
  }

  async load(): Promise<BookshopSnapshot> {
    const [books, quotes, records, tags] = await Promise.all([
      this.client.from('books').select('*, book_tags(tag_id)').order('created_at', { ascending: false }),
      this.client.from('quotes').select('*').order('created_at', { ascending: false }),
      this.client.from('records').select('*').order('updated_at', { ascending: false }),
      this.client.from('tags').select('*').order('name'),
    ]);
    if (books.error) throw books.error;
    if (quotes.error) throw quotes.error;
    if (records.error) throw records.error;
    if (tags.error) throw tags.error;

    return {
      books: (books.data as BookRow[]).map(bookFromRow),
      quotes: (quotes.data as QuoteRow[]).map(quoteFromRow),
      records: (records.data as RecordRow[]).map(recordFromRow),
      tags: (tags.data as TagRow[]).map(tagFromRow),
    };
  }

  async upsertBook(book: Book): Promise<void> {
    const userId = await this.userId();
    const { error } = await this.client.from('books').upsert(bookToRow(book, userId));
    if (error) throw error;
    // Reconcile book_tags: clear then insert the current set.
    await this.client.from('book_tags').delete().eq('book_id', book.id);
    if (book.tagIds.length > 0) {
      const rows = book.tagIds.map((tag_id) => ({ book_id: book.id, tag_id, user_id: userId }));
      const { error: linkErr } = await this.client.from('book_tags').insert(rows);
      if (linkErr) throw linkErr;
    }
  }

  async deleteBook(id: string): Promise<void> {
    const { error } = await this.client.from('books').delete().eq('id', id);
    if (error) throw error;
  }

  async upsertQuote(quote: Quote): Promise<void> {
    const userId = await this.userId();
    const { error } = await this.client.from('quotes').upsert(quoteToRow(quote, userId));
    if (error) throw error;
  }

  async deleteQuote(id: string): Promise<void> {
    const { error } = await this.client.from('quotes').delete().eq('id', id);
    if (error) throw error;
  }

  async upsertRecord(record: ReadingRecord): Promise<void> {
    const userId = await this.userId();
    const { error } = await this.client.from('records').upsert(recordToRow(record, userId));
    if (error) throw error;
  }

  async deleteRecord(id: string): Promise<void> {
    const { error } = await this.client.from('records').delete().eq('id', id);
    if (error) throw error;
  }

  async upsertTag(tag: Tag): Promise<void> {
    const userId = await this.userId();
    const { error } = await this.client.from('tags').upsert({ id: tag.id, name: tag.name, user_id: userId });
    if (error) throw error;
  }

  async deleteTag(id: string): Promise<void> {
    const { error } = await this.client.from('tags').delete().eq('id', id);
    if (error) throw error;
  }
}

/** Returns a repository when Supabase is configured, else null (local-only). */
export function getSupabaseRepository(): SupabaseRepository | null {
  const client = getSupabase();
  return client ? new SupabaseRepository(client) : null;
}
