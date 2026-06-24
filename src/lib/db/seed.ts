/**
 * Development seed data.
 *
 * Produces a believable bookshelf so charts/stats render with real numbers
 * during development. Replaced by Repository hydration + Supabase sync later.
 * (See src/lib/db/repository.ts and src/lib/sync/.)
 */

import type { Book, Quote, ReadingRecord, Rating, Tag } from '@/types/models';

export const SEED_TAGS: Tag[] = [
  { id: 'tag-novel', name: '소설' },
  { id: 'tag-essay', name: '에세이' },
  { id: 'tag-humanities', name: '인문' },
  { id: 'tag-economy', name: '경제' },
  { id: 'tag-science', name: '과학' },
];

const TAG_IDS = SEED_TAGS.map((t) => t.id);

const TITLES: [string, string][] = [
  ['데미안', '헤르만 헤세'],
  ['불안', '알랭 드 보통'],
  ['코스모스', '칼 세이건'],
  ['사피엔스', '유발 하라리'],
  ['미움받을 용기', '기시미 이치로'],
  ['총, 균, 쇠', '재레드 다이아몬드'],
  ['멋진 신세계', '올더스 헉슬리'],
  ['오만과 편견', '제인 오스틴'],
  ['죽음의 수용소에서', '빅터 프랭클'],
  ['이기적 유전자', '리처드 도킨스'],
  ['파친코', '이민진'],
  ['군중심리', '귀스타브 르 봉'],
  ['아주 작은 습관의 힘', '제임스 클리어'],
  ['1984', '조지 오웰'],
  ['시간의 역사', '스티븐 호킹'],
  ['공정하다는 착각', '마이클 샌델'],
  ['연금술사', '파울로 코엘료'],
  ['그리스인 조르바', '니코스 카잔차키스'],
  ['넛지', '리처드 탈러'],
  ['모순', '양귀자'],
  ['총균쇠 그 후', '재레드 다이아몬드'],
  ['클루지', '개리 마커스'],
  ['팩트풀니스', '한스 로슬링'],
  ['책 읽는 삶', '찰스 반 도렌'],
];

const COVER_GRADIENTS = [
  '#7A5638',
  '#516D7C',
  '#26384A',
  '#B5602F',
  '#A07C33',
  '#6E5546',
];

/** Completed books per month (Jan→Dec); sum = 18 (matches the goal-card mock). */
const MONTHLY_DONE = [1, 0, 2, 3, 1, 2, 4, 1, 0, 1, 2, 1];

function iso(year: number, month1: number, day: number): string {
  // month1 is 1-based
  return new Date(Date.UTC(year, month1 - 1, day, 9, 0, 0)).toISOString();
}

function buildSeed(): { books: Book[]; quotes: Quote[]; records: ReadingRecord[] } {
  const now = new Date();
  const year = now.getFullYear();
  const nowIso = now.toISOString();

  const books: Book[] = [];
  const quotes: Quote[] = [];
  const records: ReadingRecord[] = [];

  let t = 0; // title cursor
  let n = 0; // running index for deterministic variety

  const nextTitle = () => TITLES[t++ % TITLES.length];

  const pushBook = (b: Omit<Book, 'createdAt' | 'updatedAt'>) => {
    books.push({ ...b, createdAt: nowIso, updatedAt: nowIso });
  };

  // ── DONE books spread across months → drives monthly chart + year count ──
  MONTHLY_DONE.forEach((count, monthIdx) => {
    for (let i = 0; i < count; i++) {
      const [title, author] = nextTitle();
      const id = `book-done-${monthIdx + 1}-${i}`;
      const rating = ((3 + ((n + i) % 3)) as Rating); // 3..5
      pushBook({
        id,
        title,
        author,
        coverImageUrl: undefined,
        readingStatus: 'DONE',
        rating,
        tagIds: [TAG_IDS[n % TAG_IDS.length]],
        startedDate: iso(year, monthIdx + 1, 2),
        finishedDate: iso(year, monthIdx + 1, 12 + i),
      });
      // a couple of quotes per finished book
      const qCount = 2 + ((n + i) % 4); // 2..5
      for (let q = 0; q < qCount; q++) {
        quotes.push({
          id: `${id}-q${q}`,
          bookId: id,
          text: '밑줄 그은 문장이 여기에 들어갑니다.',
          pageNumber: 20 + q * 17,
          createdAt: nowIso,
        });
      }
      records.push({
        id: `${id}-r0`,
        bookId: id,
        title: `${title} 독후감`,
        body: '읽고 난 생각을 정리한 기록입니다.',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      n++;
    }
  });

  // ── READING (3) ──
  for (let i = 0; i < 3; i++) {
    const [title, author] = nextTitle();
    const id = `book-reading-${i}`;
    pushBook({
      id,
      title,
      author,
      readingStatus: 'READING',
      tagIds: [TAG_IDS[(n + 1) % TAG_IDS.length]],
      startedDate: iso(year, Math.max(1, now.getMonth()), 5),
    });
    n++;
  }

  // ── WANT (4) ──
  for (let i = 0; i < 4; i++) {
    const [title, author] = nextTitle();
    const id = `book-want-${i}`;
    pushBook({
      id,
      title,
      author,
      readingStatus: 'WANT',
      tagIds: [TAG_IDS[(n + 2) % TAG_IDS.length]],
    });
    n++;
  }

  return { books, quotes, records };
}

/** Stable cover gradient stops for a given book id (used by cover placeholder). */
export function coverColorsFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const base = COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
  return [base, base];
}

export const SEED = buildSeed();
