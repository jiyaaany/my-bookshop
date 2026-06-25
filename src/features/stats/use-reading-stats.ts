/**
 * Derives the 통계(Stats) view model from the local store.
 * Pure selectors over books/quotes/tags — no mock numbers.
 */

import { useMemo } from 'react';

import { GenrePalette } from '@/constants/theme';
import { useBooks, usePreferences, useQuotes, useTags } from '@/lib/store/bookshop-store';
import type { Book, Tag } from '@/types/models';

export interface MonthlyDatum {
  /** 1–12 label. */
  label: string;
  count: number;
}

export interface GenreDatum {
  name: string;
  count: number;
  /** 0–1 share relative to the largest genre. */
  share: number;
  color: string;
}

export interface ReadingStats {
  year: number;
  goal: number;
  completedThisYear: number;
  goalPercent: number; // 0–100, not clamped past 100 for the label
  remaining: number;
  readingCount: number;
  totalQuotes: number;
  monthly: MonthlyDatum[];
  monthlyMax: number;
  genres: GenreDatum[];
  hasData: boolean;
}

function finishedYear(book: Book): number | null {
  if (book.readingStatus !== 'DONE' || !book.finishedDate) return null;
  const d = new Date(book.finishedDate);
  return Number.isNaN(d.getTime()) ? null : d.getUTCFullYear();
}

export function computeReadingStats(
  books: Book[],
  quotesCount: number,
  tags: Tag[],
  goal: number,
  now: Date,
): ReadingStats {
  const year = now.getFullYear();

  const doneThisYear = books.filter((b) => finishedYear(b) === year);
  const completedThisYear = doneThisYear.length;

  // Monthly completed (Jan→Dec)
  const monthlyCounts = new Array(12).fill(0) as number[];
  for (const b of doneThisYear) {
    const m = new Date(b.finishedDate as string).getUTCMonth();
    monthlyCounts[m] += 1;
  }
  const monthly: MonthlyDatum[] = monthlyCounts.map((count, i) => ({
    label: String(i + 1),
    count,
  }));
  const monthlyMax = Math.max(1, ...monthlyCounts);

  // Genre distribution across the whole library (by tag).
  const tagName = new Map(tags.map((t) => [t.id, t.name]));
  const counts = new Map<string, number>();
  for (const b of books) {
    for (const id of b.tagIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  const sorted = [...counts.entries()]
    .map(([id, count]) => ({ name: tagName.get(id) ?? '기타', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, GenrePalette.length);
  const genreMax = Math.max(1, ...sorted.map((g) => g.count));
  const genres: GenreDatum[] = sorted.map((g, i) => ({
    ...g,
    share: g.count / genreMax,
    color: GenrePalette[i % GenrePalette.length],
  }));

  const readingCount = books.filter((b) => b.readingStatus === 'READING').length;
  const goalPercent = goal > 0 ? Math.round((completedThisYear / goal) * 100) : 0;
  const remaining = Math.max(0, goal - completedThisYear);

  return {
    year,
    goal,
    completedThisYear,
    goalPercent,
    remaining,
    readingCount,
    totalQuotes: quotesCount,
    monthly,
    monthlyMax,
    genres,
    hasData: completedThisYear > 0 || quotesCount > 0 || genres.length > 0,
  };
}

export function useReadingStats(): ReadingStats {
  const books = useBooks();
  const quotes = useQuotes();
  const tags = useTags();
  const { yearlyGoal } = usePreferences();

  return useMemo(
    () => computeReadingStats(books, quotes.length, tags, yearlyGoal, new Date()),
    [books, quotes.length, tags, yearlyGoal],
  );
}
