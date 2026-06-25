/**
 * 책장(Library) view model — filter + sort + per-status counts over the store.
 * Filter/sort are screen-local UI state, passed in by the screen.
 */

import { useMemo } from 'react';

import { useBooks, useTags } from '@/lib/store/bookshop-store';
import {
  READING_STATUS_ORDER,
  type Book,
  type ReadingStatus,
  type StatusFilter,
} from '@/types/models';

export type SortOrder = 'recent' | 'title' | 'rating';

export const SORT_LABEL: Record<SortOrder, string> = {
  recent: '최근 추가순',
  title: '제목순',
  rating: '별점순',
};

export const SORT_CYCLE: SortOrder[] = ['recent', 'title', 'rating'];

function sortBooks(books: Book[], order: SortOrder): Book[] {
  const copy = [...books];
  switch (order) {
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    case 'rating':
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case 'recent':
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export interface LibraryView {
  /** Books after filter + sort. */
  books: Book[];
  /** Total in the library (ignores the active filter). */
  total: number;
  /** Count per status filter, for the chip labels / count row. */
  counts: Record<StatusFilter, number>;
}

export function useLibrary(filter: StatusFilter, sort: SortOrder, query = ''): LibraryView {
  const all = useBooks();
  const tags = useTags();

  return useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      ALL: all.length,
      WANT: 0,
      READING: 0,
      DONE: 0,
    };
    for (const b of all) counts[b.readingStatus] += 1;

    let list = filter === 'ALL' ? all : all.filter((b) => b.readingStatus === filter);

    const q = query.trim().toLowerCase();
    if (q) {
      const nameById = new Map(tags.map((t) => [t.id, t.name.toLowerCase()]));
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.tagIds.some((id) => (nameById.get(id) ?? '').includes(q)),
      );
    }

    return { books: sortBooks(list, sort), total: all.length, counts };
  }, [all, tags, filter, sort, query]);
}

export const STATUS_FILTERS: StatusFilter[] = ['ALL', ...READING_STATUS_ORDER];
export type { ReadingStatus };
