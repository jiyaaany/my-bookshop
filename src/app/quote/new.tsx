import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ImageIcon, TrashIcon } from '@/components/icons';
import { BookMiniRow } from '@/components/ui/book-mini-row';
import { FormInput } from '@/components/ui/form-input';
import { NavHeader } from '@/components/ui/nav-header';
import { Screen } from '@/components/ui/screen';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addQuote, deleteQuote, updateQuote, useBook, useQuote } from '@/lib/store/bookshop-store';

export default function QuoteEditorScreen() {
  const theme = useTheme();
  const { bookId, quoteId } = useLocalSearchParams<{ bookId: string; quoteId?: string }>();
  const book = useBook(bookId);
  const existing = useQuote(quoteId);
  const editing = !!existing;

  const [text, setText] = useState(existing?.text ?? '');
  const [page, setPage] = useState(existing?.pageNumber != null ? String(existing.pageNumber) : '');

  const canSave = text.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    const pageNumber = page ? Number(page) : undefined;
    if (editing && existing) {
      updateQuote(existing.id, { text, pageNumber });
    } else if (bookId) {
      addQuote(bookId, text, pageNumber);
    }
    router.back();
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('이 구절을 삭제할까요?', undefined, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteQuote(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      <NavHeader
        title={editing ? '구절 편집' : '구절 추가'}
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
          {book ? (
            <View style={styles.mb}>
              <BookMiniRow book={book} />
            </View>
          ) : null}

          <FormInput
            label="구절"
            value={text}
            onChangeText={setText}
            placeholder="기억에 남기고 싶은 문장을 적어 보세요"
            multiline
            autoFocus={!editing}
            style={styles.quoteInput}
          />

          <View style={styles.pageRow}>
            <Text style={[styles.pageLabel, { color: theme.eyebrow }]}>쪽수</Text>
            <FormInput
              value={page}
              onChangeText={(t) => setPage(t.replace(/[^0-9]/g, ''))}
              placeholder="예: 128"
              keyboardType="number-pad"
              containerStyle={styles.pageInput}
            />
          </View>

          {editing ? (
            <Pressable onPress={onDelete} style={styles.deleteRow} accessibilityRole="button">
              <TrashIcon size={16} color={theme.destructive} />
              <Text style={[styles.deleteText, { color: theme.destructive }]}>이 구절 삭제</Text>
            </Pressable>
          ) : null}
        </ScrollView>

        {!editing ? (
          <View style={[styles.ocrBar, { backgroundColor: theme.surfaceSunken, borderTopColor: theme.border }]}>
            <View style={[styles.ocrBtn, { borderColor: theme.border }]}>
              <ImageIcon size={18} color={theme.textTertiary} />
              <Text style={[styles.ocrText, { color: theme.textTertiary }]}>사진으로 구절 따오기 (OCR)</Text>
              <View style={[styles.soonBadge, { backgroundColor: theme.surfaceMuted }]}>
                <Text style={[styles.soonText, { color: theme.accent }]}>곧</Text>
              </View>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: Spacing.two, paddingBottom: 100 },
  mb: { marginBottom: 22 },
  save: { fontSize: 15, fontWeight: '700' },
  quoteInput: { minHeight: 200, fontSize: 15, lineHeight: 27 },
  pageRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 18 },
  pageLabel: { fontSize: 13, fontWeight: '600' },
  pageInput: { width: 110 },
  deleteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 32 },
  deleteText: { fontSize: 13.5, fontWeight: '600' },
  ocrBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 26, borderTopWidth: 1 },
  ocrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radii.md,
    paddingVertical: 13,
  },
  ocrText: { fontSize: 14, fontWeight: '600' },
  soonBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radii.full },
  soonText: { fontSize: 10, fontWeight: '700' },
});
