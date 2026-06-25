import { StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/ui/book-cover';
import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Book } from '@/types/models';

interface BookMiniRowProps {
  book: Book;
  coverWidth?: number;
}

/** Compact "which book" row (구절/기록 작성 상단). */
export function BookMiniRow({ book, coverWidth = 38 }: BookMiniRowProps) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.surfaceMuted }]}>
      <View style={{ width: coverWidth }}>
        <BookCover book={book} showOverlay={false} radius={4} />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: theme.heading }]} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
          {book.author}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radii.md,
  },
  meta: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700' },
  author: { fontSize: 12, marginTop: 2 },
});
