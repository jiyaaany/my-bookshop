import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChevronDownIcon, CloseIcon, OpenBookIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { BookCard } from '@/components/ui/book-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Fab } from '@/components/ui/fab';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { SortSheet } from '@/components/ui/sort-sheet';
import { TagChip } from '@/components/ui/tag-chip';
import { Spacing, Type } from '@/constants/theme';
import { SORT_LABEL, STATUS_FILTERS, useLibrary } from '@/features/library/use-library';
import { retryBootstrap } from '@/lib/store/bootstrap';
import { setPreferences, usePreferences, useStatus, useStoreError } from '@/lib/store/bookshop-store';
import { useTheme } from '@/hooks/use-theme';
import { STATUS_FILTER_LABEL, type Book, type StatusFilter } from '@/types/models';

const SCREEN_PAD = 22;

export default function LibraryScreen() {
  const theme = useTheme();
  const status = useStatus();
  const error = useStoreError();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  // Sort is driven by the saved preference (설정 → 기본 정렬), so the two stay in sync.
  const { defaultSort } = usePreferences();
  const { books, total, counts } = useLibrary(filter, defaultSort, searching ? query : '');

  const openBook = (book: Book) => router.push(`/book/${book.id}`);
  const addBook = () => router.push('/book/new');
  const closeSearch = () => {
    setSearching(false);
    setQuery('');
  };

  const loading = status === 'loading';
  const errored = status === 'error';
  const firstRun = !loading && !errored && total === 0;

  return (
    <Screen>
      {searching ? (
        <SearchBar value={query} onChange={setQuery} onClose={closeSearch} />
      ) : (
        <Header onSearch={() => setSearching(true)} />
      )}

      {loading ? (
        <LibrarySkeleton />
      ) : errored ? (
        <ErrorState
          title="책장을 불러오지 못했어요"
          description={error ?? '네트워크 상태를 확인하고 다시 시도해 주세요.'}
          onRetry={() => void retryBootstrap()}
        />
      ) : firstRun ? (
        <EmptyState
          icon={<OpenBookIcon size={56} color="#BC8460" />}
          title="첫 책을 추가해 보세요"
          description={'나만의 작은 책방을 채워볼까요?\n읽은 책과 인상 깊은 구절을 기록할 수 있어요.'}
          actionVariant="solid"
          action={{
            label: '책 추가하기',
            onPress: addBook,
            icon: <PlusIcon size={18} color={theme.onPrimary} strokeWidth={2.4} />,
          }}
        />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(b) => b.id}
          numColumns={2}
          renderItem={({ item }) => <BookCard book={item} onPress={openBook} />}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <FilterChips filter={filter} counts={counts} onChange={setFilter} />
              <View style={styles.countRow}>
                <Text style={[styles.countText, { color: theme.textSecondary }]}>
                  {searching ? '검색 결과 ' : `${STATUS_FILTER_LABEL[filter]} `}
                  <Text style={{ color: theme.primary, fontWeight: '700' }}>
                    {searching ? books.length : counts[filter]}
                  </Text>
                  권
                </Text>
                <Pressable onPress={() => setSortOpen(true)} style={styles.sortBtn} accessibilityRole="button">
                  <Text style={[styles.sortText, { color: theme.primary }]}>{SORT_LABEL[defaultSort]}</Text>
                  <ChevronDownIcon size={14} color={theme.primary} />
                </Pressable>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.inlineEmpty}>
              <Text style={[styles.inlineEmptyText, { color: theme.textSecondary }]}>
                {searching ? '검색 결과가 없어요.' : '이 상태의 책이 아직 없어요.'}
              </Text>
            </View>
          }
        />
      )}

      {!firstRun && !loading && !errored ? <Fab onPress={addBook} /> : null}

      <SortSheet
        visible={sortOpen}
        value={defaultSort}
        onSelect={(s) => {
          setPreferences({ defaultSort: s });
          setSortOpen(false);
        }}
        onClose={() => setSortOpen(false)}
      />
    </Screen>
  );
}

// ── Header (title + search) ─────────────────────────────────────

function Header({ onSearch }: { onSearch: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.eyebrow, { color: theme.eyebrow }]}>MY BOOKSHOP</Text>
        <Text style={[styles.brand, { color: theme.heading }]}>번잡한 책방</Text>
      </View>
      <Pressable
        onPress={onSearch}
        accessibilityRole="button"
        accessibilityLabel="검색"
        style={[styles.searchBtn, { backgroundColor: theme.surfaceMuted }]}>
        <SearchIcon size={20} color={theme.primary} />
      </Pressable>
    </View>
  );
}

// ── Search bar ──────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (t: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.searchRow}>
      <View style={[styles.searchField, { backgroundColor: theme.surfaceMuted }]}>
        <SearchIcon size={18} color={theme.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="제목 · 저자 · 태그 검색"
          placeholderTextColor={theme.textSecondary}
          autoFocus
          returnKeyType="search"
          style={[styles.searchInput, { color: theme.heading }]}
        />
        {value.length > 0 ? (
          <Pressable onPress={() => onChange('')} hitSlop={8} accessibilityLabel="지우기">
            <CloseIcon size={16} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
        <Text style={[styles.searchCancel, { color: theme.primary }]}>취소</Text>
      </Pressable>
    </View>
  );
}

// ── Filter chips ────────────────────────────────────────────────

function FilterChips({
  filter,
  counts,
  onChange,
}: {
  filter: StatusFilter;
  counts: Record<StatusFilter, number>;
  onChange: (f: StatusFilter) => void;
}) {
  return (
    <View style={styles.chips}>
      {STATUS_FILTERS.map((f) => (
        <TagChip
          key={f}
          label={STATUS_FILTER_LABEL[f]}
          selected={filter === f}
          onPress={() => onChange(f)}
        />
      ))}
    </View>
  );
}

// ── Loading skeleton ────────────────────────────────────────────

function LibrarySkeleton() {
  return (
    <View style={styles.skeletonRoot}>
      <View style={styles.chips}>
        {[54, 78, 66, 54].map((w, i) => (
          <Skeleton key={i} width={w} height={34} radius={999} />
        ))}
      </View>
      <View style={styles.skeletonGrid}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.skeletonCell}>
            <Skeleton width="100%" height={undefined} radius={5} style={styles.skeletonCover} />
            <Skeleton width="85%" height={13} style={styles.skeletonLine} />
            <Skeleton width="55%" height={11} style={styles.skeletonLineSm} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SCREEN_PAD,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  eyebrow: { ...Type.eyebrow, marginBottom: 3 },
  brand: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SCREEN_PAD,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 14.5, padding: 0 },
  searchCancel: { fontSize: 14.5, fontWeight: '600' },

  listContent: { paddingHorizontal: SCREEN_PAD, paddingBottom: 130 },
  listHeader: { paddingBottom: Spacing.three },
  column: { gap: 16, marginBottom: 18 },

  chips: { flexDirection: 'row', gap: 6, paddingVertical: Spacing.three },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
  countText: { fontSize: 13 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 13, fontWeight: '500' },

  inlineEmpty: { paddingVertical: Spacing.eight, alignItems: 'center' },
  inlineEmptyText: { fontSize: 14 },

  skeletonRoot: { paddingHorizontal: SCREEN_PAD },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: Spacing.three,
  },
  skeletonCell: { width: '47%' },
  skeletonCover: { aspectRatio: 2 / 3 },
  skeletonLine: { marginTop: 11 },
  skeletonLineSm: { marginTop: 7 },
});
