import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MoreVerticalIcon, QuoteIcon, PencilIcon } from '@/components/icons';
import { BookCover } from '@/components/ui/book-cover';
import { NavHeader } from '@/components/ui/nav-header';
import { Screen } from '@/components/ui/screen';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusSelector } from '@/components/ui/status-selector';
import { Radii, Spacing } from '@/constants/theme';
import { useScheme, useTheme } from '@/hooks/use-theme';
import {
  deleteBook,
  setBookStatus,
  useBook,
  useQuotesFor,
  useRecordsFor,
  useTagsByIds,
} from '@/lib/store/bookshop-store';
import type { Quote, ReadingRecord } from '@/types/models';

const PAD = 24;

function md(date?: string): string | null {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}
function ymd(date?: string): string | null {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export default function BookDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useBook(id);
  const quotes = useQuotesFor(id);
  const records = useRecordsFor(id);
  const tags = useTagsByIds(book?.tagIds ?? []);

  if (!book) {
    return (
      <Screen>
        <NavHeader onLeft={() => router.back()} />
        <View style={styles.missing}>
          <Text style={{ color: theme.textSecondary }}>책을 찾을 수 없어요.</Text>
        </View>
      </Screen>
    );
  }

  const onMore = () => {
    Alert.alert(book.title, undefined, [
      { text: '취소', style: 'cancel' },
      { text: '편집', onPress: () => router.push(`/book/edit?id=${book.id}`) },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteBook(book.id);
          router.back();
        },
      },
    ]);
  };

  const period = md(book.startedDate)
    ? `${md(book.startedDate)} – ${md(book.finishedDate) ?? ''}`
    : '–';
  const meta = [book.publisher, book.pageCount ? `${book.pageCount}쪽` : null].filter(Boolean).join(' · ');

  return (
    <Screen>
      <NavHeader
        onLeft={() => router.back()}
        right={
          <Pressable onPress={onMore} hitSlop={10} accessibilityLabel="더보기">
            <MoreVerticalIcon size={22} color={theme.heading} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book header */}
        <View style={styles.headerRow}>
          <View style={styles.coverWrap}>
            <BookCover book={book} showOverlay={false} radius={6} />
          </View>
          <View style={styles.headerInfo}>
            <StatusBadge status={book.readingStatus} size="inline" />
            <Text style={[styles.title, { color: theme.heading }]}>{book.title}</Text>
            <Text style={[styles.metaText, { color: theme.textTertiary }]}>
              {book.author}
              {meta ? `\n${meta}` : ''}
            </Text>
            <View style={styles.stars}>
              {book.rating != null ? (
                <StarRating rating={book.rating} size={18} />
              ) : (
                <Text style={[styles.emptyStars, { color: theme.textSecondary }]}>☆☆☆☆☆</Text>
              )}
            </View>
          </View>
        </View>

        <StatusSelector value={book.readingStatus} onChange={(s) => setBookStatus(book.id, s)} />

        <Divider />

        {/* Dates */}
        <View style={styles.dateRow}>
          <Field label="읽은 기간" value={period} />
          <Field label="구매일" value={ymd(book.purchasedDate) ?? '–'} />
        </View>

        {/* Tags */}
        {tags.length > 0 ? (
          <View style={styles.block}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>태그</Text>
            <View style={styles.tagWrap}>
              {tags.map((t) => (
                <View key={t.id} style={[styles.tag, { backgroundColor: theme.surfaceMuted }]}>
                  <Text style={[styles.tagText, { color: theme.textTertiary }]}>{t.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Memo */}
        {book.memo ? (
          <View style={[styles.memo, { backgroundColor: theme.surfaceSunken }]}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>메모</Text>
            <Text style={[styles.memoText, { color: theme.textTertiary }]}>{book.memo}</Text>
          </View>
        ) : null}

        <Divider />

        {/* Quotes */}
        <SectionHeader
          title="인상깊은 구절"
          count={quotes.length}
          actionLabel="+ 구절 추가"
          onAction={() => router.push(`/quote/new?bookId=${book.id}`)}
        />
        {quotes.length > 0 ? (
          <View style={styles.list}>
            {quotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                onPress={() => router.push(`/quote/new?bookId=${book.id}&quoteId=${q.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyBox icon={<QuoteIcon size={30} color="#C2A988" />} text="마음에 남은 문장을 기록해 보세요" />
        )}

        {/* Records */}
        <SectionHeader
          title="기록"
          count={records.length}
          actionLabel="+ 기록 추가"
          onAction={() => router.push(`/record/new?bookId=${book.id}`)}
        />
        {records.length > 0 ? (
          <View style={styles.list}>
            {records.map((r) => (
              <RecordCard
                key={r.id}
                record={r}
                onPress={() => router.push(`/record/new?bookId=${book.id}&recordId=${r.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyBox icon={<PencilIcon size={28} color="#C2A988" />} text="읽으며 떠오른 생각을 남겨 보세요" />
        )}
      </ScrollView>
    </Screen>
  );
}

// ── sub-components ──────────────────────────────────────────────

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: theme.heading }]}>{value}</Text>
    </View>
  );
}

function SectionHeader({
  title,
  count,
  actionLabel,
  onAction,
}: {
  title: string;
  count: number;
  actionLabel: string;
  onAction: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.heading }]}>
        {title}
        {count > 0 ? <Text style={{ color: theme.accent }}> {count}</Text> : null}
      </Text>
      <Pressable onPress={onAction} hitSlop={8}>
        <Text style={[styles.sectionAction, { color: theme.accent }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function EmptyBox({ icon, text }: { icon: React.ReactNode; text: string }) {
  const scheme = useScheme();
  const theme = useTheme();
  return (
    <View
      style={[
        styles.emptyBox,
        {
          backgroundColor: theme.surfaceSunken,
          borderColor: scheme === 'dark' ? theme.border : '#D8C3A8',
        },
      ]}>
      {icon}
      <Text style={[styles.emptyText, { color: theme.textTertiary }]}>{text}</Text>
    </View>
  );
}

function QuoteCard({ quote, onPress }: { quote: Quote; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.quoteText, { color: theme.heading }]}>{quote.text}</Text>
      {quote.pageNumber != null ? (
        <Text style={[styles.quotePage, { color: theme.textSecondary }]}>p.{quote.pageNumber}</Text>
      ) : null}
    </Pressable>
  );
}

function RecordCard({ record, onPress }: { record: ReadingRecord; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.recordTitle, { color: theme.heading }]} numberOfLines={1}>
        {record.title}
      </Text>
      <Text style={[styles.recordBody, { color: theme.textSecondary }]} numberOfLines={2}>
        {record.body}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 48 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerRow: { flexDirection: 'row', gap: 18, paddingHorizontal: PAD, paddingTop: Spacing.four, paddingBottom: 22 },
  coverWrap: { width: 118 },
  headerInfo: { flex: 1, paddingTop: 4, gap: 0 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, lineHeight: 29, marginTop: 10 },
  metaText: { fontSize: 13.5, marginTop: 6, lineHeight: 21 },
  stars: { marginTop: 10 },
  emptyStars: { fontSize: 18, letterSpacing: 2 },

  divider: { height: 1, marginHorizontal: PAD, marginVertical: 18 },

  dateRow: { flexDirection: 'row', gap: 14, paddingHorizontal: PAD, paddingBottom: 18 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 11, marginBottom: 5 },
  fieldValue: { fontSize: 13.5, fontWeight: '600' },

  block: { paddingHorizontal: PAD, paddingBottom: 18 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full },
  tagText: { fontSize: 12, fontWeight: '500' },

  memo: { marginHorizontal: PAD, marginBottom: 18, padding: 16, borderRadius: Radii.md },
  memoText: { fontSize: 13.5, lineHeight: 22 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionAction: { fontSize: 13, fontWeight: '600' },

  list: { paddingHorizontal: PAD, paddingBottom: 18, gap: 10 },
  card: { borderWidth: 1, borderRadius: Radii.md, padding: 16 },
  pressed: { opacity: 0.9 },
  quoteText: { fontSize: 13.5, lineHeight: 23 },
  quotePage: { fontSize: 11, marginTop: 8 },
  recordTitle: { fontSize: 14.5, fontWeight: '700', marginBottom: 6 },
  recordBody: { fontSize: 12.5, lineHeight: 20 },

  emptyBox: {
    marginHorizontal: PAD,
    marginBottom: 22,
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 13.5, lineHeight: 22 },
});
