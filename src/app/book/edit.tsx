import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormInput } from '@/components/ui/form-input';
import { NavHeader } from '@/components/ui/nav-header';
import { RatingInput } from '@/components/ui/rating-input';
import { Screen } from '@/components/ui/screen';
import { StatusSelector } from '@/components/ui/status-selector';
import { TagSelector } from '@/components/ui/tag-selector';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ensureTags, updateBook, useBook, useTags } from '@/lib/store/bookshop-store';
import type { Rating, ReadingStatus } from '@/types/models';

export default function BookEditScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useBook(id);
  const tags = useTags();

  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [publisher, setPublisher] = useState(book?.publisher ?? '');
  const [pageCount, setPageCount] = useState(book?.pageCount != null ? String(book.pageCount) : '');
  const [isbn, setIsbn] = useState(book?.isbn ?? '');
  const [status, setStatus] = useState<ReadingStatus>(book?.readingStatus ?? 'WANT');
  const [rating, setRating] = useState<Rating | undefined>(book?.rating);
  const [memo, setMemo] = useState(book?.memo ?? '');
  const [tagIds, setTagIds] = useState<string[]>(book?.tagIds ?? []);
  const [newTag, setNewTag] = useState('');

  if (!book) {
    return (
      <Screen>
        <NavHeader title="책 편집" titlePlacement="center" onLeft={() => router.back()} />
        <View style={styles.missing}>
          <Text style={{ color: theme.textSecondary }}>책을 찾을 수 없어요.</Text>
        </View>
      </Screen>
    );
  }

  const toggleTag = (tid: string) =>
    setTagIds((s) => (s.includes(tid) ? s.filter((x) => x !== tid) : [...s, tid]));

  const addNewTag = () => {
    const name = newTag.trim();
    if (!name) return;
    const [tid] = ensureTags([name]);
    if (tid) setTagIds((s) => (s.includes(tid) ? s : [...s, tid]));
    setNewTag('');
  };

  const canSave = title.trim().length > 0 && author.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    updateBook(book.id, {
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim() || undefined,
      pageCount: pageCount ? Number(pageCount) : undefined,
      isbn: isbn.trim() || undefined,
      readingStatus: status,
      rating: status === 'DONE' ? rating : undefined,
      memo: memo.trim() || undefined,
      tagIds,
    });
    router.back();
  };

  return (
    <Screen>
      <NavHeader
        title="책 편집"
        titlePlacement="center"
        leftIcon="close"
        onLeft={() => router.back()}
        right={
          <Pressable onPress={onSave} hitSlop={8} disabled={!canSave}>
            <Text style={[styles.save, { color: canSave ? theme.accent : theme.textSecondary }]}>저장</Text>
          </Pressable>
        }
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FormInput label="제목" value={title} onChangeText={setTitle} containerStyle={styles.mb} />
          <View style={[styles.row, styles.mb]}>
            <FormInput label="저자" value={author} onChangeText={setAuthor} containerStyle={styles.flex} />
            <FormInput label="출판사" value={publisher} onChangeText={setPublisher} containerStyle={styles.flex} />
          </View>
          <View style={[styles.row, styles.mb]}>
            <FormInput
              label="쪽수"
              value={pageCount}
              onChangeText={(t) => setPageCount(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
            <FormInput label="ISBN" value={isbn} onChangeText={setIsbn} containerStyle={styles.flex2} />
          </View>

          <Text style={[styles.label, { color: theme.eyebrow }]}>상태</Text>
          <View style={styles.mb}>
            <StatusSelector value={status} onChange={setStatus} filled />
          </View>

          {status === 'DONE' ? (
            <>
              <Text style={[styles.label, { color: theme.eyebrow }]}>별점</Text>
              <View style={styles.mb}>
                <RatingInput value={rating} onChange={setRating} />
              </View>
            </>
          ) : null}

          <Text style={[styles.label, { color: theme.eyebrow }]}>태그</Text>
          <TagSelector tags={tags} selectedIds={tagIds} onToggle={toggleTag} />
          <View style={styles.newTagRow}>
            <FormInput
              value={newTag}
              onChangeText={setNewTag}
              placeholder="새 태그 추가"
              onSubmitEditing={addNewTag}
              returnKeyType="done"
              containerStyle={styles.flex}
            />
            <Pressable
              onPress={addNewTag}
              style={[styles.addBtn, { backgroundColor: theme.surfaceMuted }]}
              accessibilityLabel="태그 추가">
              <Text style={[styles.addBtnText, { color: theme.primary }]}>추가</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { color: theme.eyebrow }]}>메모</Text>
          <FormInput value={memo} onChangeText={setMemo} placeholder="메모" multiline />
        </ScrollView>

        <View style={[styles.saveBar, { backgroundColor: theme.screen }]}>
          <Pressable
            onPress={canSave ? onSave : undefined}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: theme.primary, opacity: canSave ? (pressed ? 0.9 : 1) : 0.5 },
            ]}>
            <Text style={[styles.saveBtnText, { color: theme.onPrimary }]}>저장</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 1.4 },
  content: { paddingHorizontal: 24, paddingTop: Spacing.two, paddingBottom: 120 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  mb: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  save: { fontSize: 15, fontWeight: '700' },
  newTagRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10, marginBottom: 14 },
  addBtn: { paddingHorizontal: 16, paddingVertical: 13, borderRadius: Radii.md },
  addBtnText: { fontSize: 14, fontWeight: '700' },
  saveBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  saveBtn: { borderRadius: Radii.lg, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
});
