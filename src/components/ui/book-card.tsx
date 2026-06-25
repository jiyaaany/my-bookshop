import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/ui/book-cover';
import { StarRating } from '@/components/ui/star-rating';
import { useTheme } from '@/hooks/use-theme';
import type { Book } from '@/types/models';

interface BookCardProps {
  book: Book;
  onPress?: (book: Book) => void;
}

/** Grid cell: cover + title / author / rating (rating shown for 완독 only). */
export function BookCard({ book, onPress }: BookCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onPress?.(book)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <BookCover book={book} />
      <Text style={[styles.title, { color: theme.heading }]} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
        {book.author}
      </Text>
      {book.readingStatus === 'DONE' && book.rating != null ? (
        <View style={styles.rating}>
          <StarRating rating={book.rating} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  pressed: { opacity: 0.85 },
  title: {
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 9,
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  author: {
    fontSize: 11.5,
    marginTop: 2,
  },
  rating: {
    marginTop: 3,
  },
});
