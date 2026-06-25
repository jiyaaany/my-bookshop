/**
 * ISBN → book metadata via the Supabase edge function (Aladin → Kakao proxy).
 *
 * The API keys live only in the edge function (supabase/functions/book-lookup),
 * never in the client. Returns null when the function is unconfigured or the
 * book isn't found, so the UI can fall back to manual entry.
 */

export interface BookMeta {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  coverImageUrl?: string;
  pageCount?: number;
  source?: 'aladin' | 'kakao';
}

export async function lookupByIsbn(isbn: string): Promise<BookMeta | null> {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!base) return null; // backend not wired yet → manual entry

  try {
    const res = await fetch(`${base}/functions/v1/book-lookup?isbn=${encodeURIComponent(isbn)}`, {
      headers: anon ? { Authorization: `Bearer ${anon}`, apikey: anon } : undefined,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<BookMeta>;
    if (!data?.title) return null;
    return {
      isbn,
      title: data.title,
      author: data.author ?? '',
      publisher: data.publisher,
      coverImageUrl: data.coverImageUrl,
      pageCount: data.pageCount,
      source: data.source,
    };
  } catch {
    return null;
  }
}
