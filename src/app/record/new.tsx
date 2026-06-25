import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CloseIcon, ImageIcon } from '@/components/icons';
import { BookMiniRow } from '@/components/ui/book-mini-row';
import { NavHeader } from '@/components/ui/nav-header';
import { RemoteImage } from '@/components/ui/remote-image';
import { Screen } from '@/components/ui/screen';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addRecord, newId, updateRecord, useBook, useRecord } from '@/lib/store/bookshop-store';
import { deleteRecordImages, isRemotePath, uploadRecordImage } from '@/lib/supabase/storage';

function todayLabel(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export default function RecordEditorScreen() {
  const theme = useTheme();
  const { bookId, recordId } = useLocalSearchParams<{ bookId: string; recordId?: string }>();
  const book = useBook(bookId);
  const existing = useRecord(recordId);
  const editing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [images, setImages] = useState<string[]>(existing?.imageUrls ?? []);
  const [uploading, setUploading] = useState(false);

  // Storage folder for this record's images. For a new record we use a draft id
  // (the middle path segment is cosmetic — RLS scopes by the user-id segment).
  const draftId = useRef(existing?.id ?? newId('record')).current;
  // Paths uploaded during THIS edit session — safe to hard-delete on removal,
  // unlike pre-existing images (those are cleaned up only when the save lands).
  const freshUploads = useRef(new Set<string>()).current;

  const canSave = title.trim().length > 0 || body.trim().length > 0 || images.length > 0;

  const onSave = () => {
    if (!canSave) return;
    const finalTitle = title.trim() || '무제';
    if (editing && existing) {
      updateRecord(existing.id, { title: finalTitle, body, imageUrls: images });
    } else if (bookId) {
      addRecord(bookId, finalTitle, body, images);
    }
    router.back();
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      // Upload to Storage when signed in; otherwise keep the local uri (offline).
      const path = await uploadRecordImage(draftId, asset.uri, asset.mimeType);
      const stored = path ?? asset.uri;
      if (path) freshUploads.add(path);
      setImages((prev) => [...prev, stored]);
    } catch {
      // Upload failed — fall back to the local uri so the user keeps the image.
      setImages((prev) => [...prev, asset.uri]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((u) => u !== uri));
    if (freshUploads.has(uri) && isRemotePath(uri)) {
      freshUploads.delete(uri);
      void deleteRecordImages([uri]).catch(() => {});
    }
  };

  return (
    <Screen>
      <NavHeader
        title="기록"
        leftIcon="close"
        onLeft={() => router.back()}
        right={
          <Pressable onPress={onSave} hitSlop={8} disabled={!canSave}>
            <View
              style={[
                styles.savePill,
                { backgroundColor: canSave ? theme.surfaceMuted : theme.surfaceMuted, opacity: canSave ? 1 : 0.6 },
              ]}>
              <Text style={[styles.saveText, { color: canSave ? theme.accent : theme.textSecondary }]}>저장</Text>
            </View>
          </Pressable>
        }
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {book ? (
            <View style={styles.mb}>
              <BookMiniRow book={book} coverWidth={34} />
            </View>
          ) : null}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor={theme.textSecondary}
            style={[styles.titleInput, { color: theme.heading }]}
          />
          <Text style={[styles.date, { color: theme.textSecondary }]}>{todayLabel(existing?.createdAt)}</Text>

          {/* formatting toolbar (B / i / list visual; image active) */}
          <View style={[styles.toolbar, { borderBottomColor: theme.border }]}>
            <Text style={[styles.toolBold, { color: theme.textTertiary }]}>B</Text>
            <Text style={[styles.toolItalic, { color: theme.textSecondary }]}>i</Text>
            <Text style={[styles.toolGlyph, { color: theme.textSecondary }]}>☰</Text>
            <Pressable onPress={pickImage} hitSlop={6}>
              <ImageIcon size={18} color={theme.accent} />
            </Pressable>
          </View>

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="읽으며 떠오른 생각을 자유롭게 적어 보세요."
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.bodyInput, { color: theme.heading }]}
          />

          {images.map((uri) => (
            <View key={uri} style={styles.attachmentWrap}>
              <RemoteImage path={uri} style={styles.attachment} contentFit="cover" />
              <Pressable
                onPress={() => removeImage(uri)}
                hitSlop={8}
                style={styles.removeBtn}
                accessibilityLabel="이미지 삭제">
                <CloseIcon size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.surfaceSunken, borderTopColor: theme.border }]}>
          <Pressable onPress={pickImage} hitSlop={8}>
            <ImageIcon size={22} color={theme.textTertiary} />
          </Pressable>
          <Text style={[styles.footerStatus, { color: theme.textSecondary }]}>
            {uploading ? '업로드 중…' : '자동 저장됨'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: Spacing.two, paddingBottom: 90 },
  mb: { marginBottom: 18 },
  savePill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radii.full },
  saveText: { fontSize: 14, fontWeight: '700' },
  titleInput: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, paddingBottom: 4, padding: 0 },
  date: { fontSize: 12, marginBottom: 14 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  toolBold: { fontSize: 16, fontWeight: '800' },
  toolItalic: { fontSize: 16, fontStyle: 'italic' },
  toolGlyph: { fontSize: 16 },
  bodyInput: { fontSize: 15, lineHeight: 28, paddingTop: 18, textAlignVertical: 'top', minHeight: 200 },
  attachmentWrap: { marginTop: 14 },
  attachment: { width: '100%', aspectRatio: 16 / 10, borderRadius: Radii.md },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  footerStatus: { fontSize: 13, marginLeft: 'auto' },
});
