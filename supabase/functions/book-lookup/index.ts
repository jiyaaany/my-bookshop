// 번잡한 책방 — ISBN book-lookup edge function (Supabase / Deno)
//
// WHY A PROXY: the Aladin TTBKey and Kakao REST key must never ship in the
// client bundle. The app scans an ISBN (expo-camera), then calls THIS function;
// the keys live only in the function's environment.
//
// Order: Aladin ItemLookUp (itemIdType=ISBN13) → Kakao 책 검색 v3 fallback.
//
// Configure secrets:
//   supabase secrets set ALADIN_TTB_KEY=... KAKAO_REST_KEY=...
// Deploy:
//   supabase functions deploy book-lookup
//
// NOTE: This is the documented skeleton; deno-types are resolved by the
// Supabase Edge runtime, not by the app's TypeScript project.

// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

interface BookMeta {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  coverImageUrl?: string;
  pageCount?: number;
  source: 'aladin' | 'kakao';
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function lookupAladin(isbn: string, key: string): Promise<BookMeta | null> {
  const url =
    `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${key}` +
    `&itemIdType=ISBN13&ItemId=${isbn}&output=js&Version=20131101&OptResult=packing`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.item?.[0];
  if (!item) return null;
  return {
    isbn,
    title: item.title ?? '',
    author: item.author ?? '',
    publisher: item.publisher,
    coverImageUrl: item.cover,
    pageCount: item.subInfo?.itemPage,
    source: 'aladin',
  };
}

async function lookupKakao(isbn: string, key: string): Promise<BookMeta | null> {
  const url = `https://dapi.kakao.com/v3/search/book?target=isbn&query=${isbn}`;
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data?.documents?.[0];
  if (!doc) return null;
  return {
    isbn,
    title: doc.title ?? '',
    author: (doc.authors ?? []).join(', '),
    publisher: doc.publisher,
    coverImageUrl: doc.thumbnail,
    source: 'kakao',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const isbn = new URL(req.url).searchParams.get('isbn')?.replace(/[^0-9Xx]/g, '');
  if (!isbn) {
    return Response.json({ error: 'missing isbn' }, { status: 400, headers: CORS });
  }

  const aladinKey = Deno.env.get('ALADIN_TTB_KEY');
  const kakaoKey = Deno.env.get('KAKAO_REST_KEY');

  try {
    let meta: BookMeta | null = null;
    if (aladinKey) meta = await lookupAladin(isbn, aladinKey);
    if (!meta && kakaoKey) meta = await lookupKakao(isbn, kakaoKey);
    if (!meta) {
      return Response.json({ error: 'not found' }, { status: 404, headers: CORS });
    }
    return Response.json(meta, { headers: CORS });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502, headers: CORS });
  }
});
