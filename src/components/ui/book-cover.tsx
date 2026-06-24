import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { GradientBackground } from '@/components/ui/gradient-background';
import { StatusBadge } from '@/components/ui/status-badge';
import { coverColorsFor } from '@/lib/db/seed';
import type { Book } from '@/types/models';

interface BookCoverProps {
  book: Book;
  /** Show the title/author overlay + status badge (grid covers). */
  showOverlay?: boolean;
  radius?: number;
}

/**
 * Book cover with a 2:3 aspect ratio. Uses the artwork when available, else a
 * deterministic gradient placeholder, with a spine, title/author overlay and a
 * reading-status badge — matching the 책장 mock.
 */
export function BookCover({ book, showOverlay = true, radius = 5 }: BookCoverProps) {
  const colors = coverColorsFor(book.id);
  return (
    <View style={[styles.cover, { borderRadius: radius }]}>
      {book.coverImageUrl ? (
        <Image source={{ uri: book.coverImageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <GradientBackground colors={colors} />
      )}
      <View style={styles.spine} />
      {showOverlay ? (
        <>
          <View style={styles.overlay}>
            <Text style={styles.title} numberOfLines={3}>
              {book.title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {book.author}
            </Text>
          </View>
          <View style={styles.badge}>
            <StatusBadge status={book.readingStatus} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    aspectRatio: 2 / 3,
    overflow: 'hidden',
    backgroundColor: '#5A3E2A',
    shadowColor: '#322012',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    paddingLeft: 19,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  author: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
  },
});
