import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

import { CameraIcon, CheckIcon, PencilIcon, SearchIcon } from '@/components/icons';
import { BookCover } from '@/components/ui/book-cover';
import { FormInput } from '@/components/ui/form-input';
import { NavHeader } from '@/components/ui/nav-header';
import { Screen } from '@/components/ui/screen';
import { StatusSelector } from '@/components/ui/status-selector';
import { TagSelector } from '@/components/ui/tag-selector';
import { Radii, Spacing } from '@/constants/theme';
import { lookupByIsbn, type BookMeta } from '@/features/books/book-lookup';
import { useTheme } from '@/hooks/use-theme';
import { addBook, useTags } from '@/lib/store/bookshop-store';
import type { Book, ReadingStatus } from '@/types/models';

type Mode = 'scan' | 'found' | 'notfound' | 'manual';

export default function BookAddScreen() {
  const theme = useTheme();
  const tags = useTags();
  const [permission, requestPermission] = useCameraPermissions();

  const [mode, setMode] = useState<Mode>('scan');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<BookMeta | null>(null);
  const scannedRef = useRef(false);

  // form state shared by found + manual
  const [status, setStatus] = useState<ReadingStatus>('WANT');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [form, setForm] = useState({ title: '', author: '', publisher: '', pageCount: '', isbn: '' });

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

  const handleScan = async ({ data }: { data: string }) => {
    if (scannedRef.current || loading) return;
    const isbn = data.replace(/[^0-9Xx]/g, '');
    if (isbn.length < 10) return;
    scannedRef.current = true;
    setLoading(true);
    Vibration.vibrate(); // "잡혔다" 햅틱 — 인식 즉시 피드백
    const found = await lookupByIsbn(isbn);
    setLoading(false);
    if (found) {
      setMeta(found);
      setMode('found');
    } else {
      setForm((f) => ({ ...f, isbn }));
      setMode('notfound');
    }
  };

  const resetScan = () => {
    scannedRef.current = false;
    setMeta(null);
    setMode('scan');
  };

  const toggleTag = (id: string) => setTagIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const saveFromMeta = () => {
    if (!meta) return;
    const id = addBook({
      title: meta.title,
      author: meta.author,
      publisher: meta.publisher,
      pageCount: meta.pageCount,
      isbn: meta.isbn,
      coverImageUrl: meta.coverImageUrl,
      readingStatus: status,
      tagIds,
    });
    router.replace(`/book/${id}`);
  };

  const saveManual = () => {
    if (!form.title.trim() || !form.author.trim()) return;
    const id = addBook({
      title: form.title,
      author: form.author,
      publisher: form.publisher,
      pageCount: form.pageCount ? Number(form.pageCount) : undefined,
      isbn: form.isbn,
      readingStatus: status,
      tagIds,
    });
    router.replace(`/book/${id}`);
  };

  // ── Manual entry ──
  if (mode === 'manual') {
    return (
      <Screen>
        <NavHeader title="직접 입력" leftIcon="chevron" onLeft={resetScan} />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <FormInput
              label="제목"
              value={form.title}
              onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
              placeholder="책 제목"
              containerStyle={styles.mb14}
            />
            <View style={[styles.rowGap, styles.mb14]}>
              <FormInput
                label="저자"
                value={form.author}
                onChangeText={(t) => setForm((f) => ({ ...f, author: t }))}
                placeholder="저자"
                containerStyle={styles.flex}
              />
              <FormInput
                label="출판사"
                value={form.publisher}
                onChangeText={(t) => setForm((f) => ({ ...f, publisher: t }))}
                placeholder="출판사"
                containerStyle={styles.flex}
              />
            </View>
            <View style={[styles.rowGap, styles.mb14]}>
              <FormInput
                label="쪽수"
                value={form.pageCount}
                onChangeText={(t) => setForm((f) => ({ ...f, pageCount: t.replace(/[^0-9]/g, '') }))}
                placeholder="288"
                keyboardType="number-pad"
                containerStyle={styles.flex}
              />
              <FormInput
                label="ISBN"
                value={form.isbn}
                onChangeText={(t) => setForm((f) => ({ ...f, isbn: t }))}
                placeholder="선택"
                containerStyle={styles.flex2}
              />
            </View>

            <Text style={[styles.label, { color: theme.eyebrow }]}>상태</Text>
            <View style={styles.mb16}>
              <StatusSelector value={status} onChange={setStatus} filled />
            </View>

            <Text style={[styles.label, { color: theme.eyebrow }]}>태그</Text>
            <TagSelector tags={tags} selectedIds={tagIds} onToggle={toggleTag} />
          </ScrollView>
          <SaveBar label="내 책장에 추가" disabled={!form.title.trim() || !form.author.trim()} onPress={saveManual} />
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  // ── Found result ──
  if (mode === 'found' && meta) {
    const preview: Book = {
      id: meta.isbn,
      title: meta.title,
      author: meta.author,
      coverImageUrl: meta.coverImageUrl,
      readingStatus: status,
      tagIds: [],
      createdAt: '',
      updatedAt: '',
    };
    const sub = [meta.publisher, meta.pageCount ? `${meta.pageCount}쪽` : null].filter(Boolean).join(' · ');
    return (
      <Screen>
        <NavHeader title="책 추가" leftIcon="close" onLeft={() => router.back()} />
        <ScrollView contentContainerStyle={styles.foundContent}>
          <View style={[styles.foundBanner, { backgroundColor: theme.successBg }]}>
            <CheckIcon size={17} color={theme.success} />
            <Text style={[styles.foundBannerText, { color: theme.success }]}>책을 찾았어요</Text>
          </View>

          <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={{ width: 90 }}>
              <BookCover book={preview} showOverlay={false} />
            </View>
            <View style={styles.resultMeta}>
              <Text style={[styles.resultTitle, { color: theme.heading }]}>{meta.title}</Text>
              <Text style={[styles.resultSub, { color: theme.textTertiary }]}>
                {meta.author}
                {sub ? `\n${sub}` : ''}
              </Text>
              {meta.isbn ? (
                <Text style={[styles.resultIsbn, { color: theme.textSecondary }]}>ISBN {meta.isbn}</Text>
              ) : null}
            </View>
          </View>

          <Text style={[styles.label, { color: theme.eyebrow }]}>상태</Text>
          <View style={styles.mb16}>
            <StatusSelector value={status} onChange={setStatus} filled />
          </View>
          <Text style={[styles.label, { color: theme.eyebrow }]}>태그</Text>
          <TagSelector tags={tags} selectedIds={tagIds} onToggle={toggleTag} />
        </ScrollView>
        <SaveBar label="내 책장에 추가" onPress={saveFromMeta} />
      </Screen>
    );
  }

  // ── Permission denied ──
  if (permission && !permission.granted && !permission.canAskAgain) {
    return (
      <DarkScanShell onClose={() => router.back()}>
        <View style={styles.centerDark}>
          <View style={styles.permIcon}>
            <CameraIcon size={30} color="rgba(255,255,255,0.65)" />
          </View>
          <Text style={styles.darkTitle}>카메라 권한이 필요해요</Text>
          <Text style={styles.darkBody}>바코드를 읽으려면 카메라 접근을 허용해 주세요.</Text>
          <Pressable onPress={requestPermission}>
            <Text style={styles.permLink}>설정에서 권한 허용 →</Text>
          </Pressable>
          <Pressable onPress={() => setMode('manual')} style={styles.manualLinkWrap}>
            <PencilIcon size={16} color="#E6B98C" />
            <Text style={styles.manualLink}>직접 입력하기</Text>
          </Pressable>
        </View>
      </DarkScanShell>
    );
  }

  // ── Not found ──
  if (mode === 'notfound') {
    return (
      <DarkScanShell onClose={() => router.back()}>
        <View style={styles.centerDark}>
          <View style={styles.notFoundIcon}>
            <SearchIcon size={40} color="#E6B98C" strokeWidth={1.8} />
          </View>
          <Text style={styles.darkTitle}>책을 찾지 못했어요</Text>
          <Text style={styles.darkBody}>바코드가 잘 안 보였을 수 있어요.{'\n'}다시 스캔하거나 직접 입력해 주세요.</Text>
          <View style={styles.notFoundActions}>
            <Pressable onPress={resetScan} style={styles.outlineBtn}>
              <Text style={styles.outlineBtnText}>다시 스캔</Text>
            </Pressable>
            <Pressable onPress={() => setMode('manual')} style={styles.fillBtn}>
              <Text style={styles.fillBtnText}>직접 입력하기</Text>
            </Pressable>
          </View>
        </View>
      </DarkScanShell>
    );
  }

  // ── Scanning (default) ──
  return (
    <DarkScanShell onClose={() => router.back()} title="바코드 스캔">
      <View style={styles.scanArea}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
            onBarcodeScanned={handleScan}
          />
        ) : null}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.tl, loading && styles.cornerActive]} />
          <View style={[styles.corner, styles.tr, loading && styles.cornerActive]} />
          <View style={[styles.corner, styles.bl, loading && styles.cornerActive]} />
          <View style={[styles.corner, styles.br, loading && styles.cornerActive]} />
          {loading ? (
            <View style={styles.capturedBadge}>
              <CheckIcon size={26} color="#16100C" strokeWidth={2.6} />
            </View>
          ) : null}
        </View>
        <Text style={styles.scanHint}>
          {loading ? '인식됐어요! 정보를 불러오는 중…' : '바코드를 프레임 안에 꽉 차게 비춰 주세요'}
        </Text>
        {loading ? null : (
          <Text style={styles.scanSub}>ISBN을 읽어 표지와 정보를 자동으로 채워요</Text>
        )}
      </View>
      <Pressable onPress={() => setMode('manual')} style={styles.manualLinkWrap}>
        <PencilIcon size={18} color="#E6B98C" />
        <Text style={styles.manualLink}>직접 입력하기</Text>
      </Pressable>
    </DarkScanShell>
  );
}

// ── Dark camera shell ───────────────────────────────────────────

function DarkScanShell({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}) {
  return (
    <View style={styles.darkRoot}>
      <View style={styles.darkHeader}>
        <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="닫기">
          <Text style={styles.closeX}>✕</Text>
        </Pressable>
        {title ? <Text style={styles.darkHeaderTitle}>{title}</Text> : null}
      </View>
      {children}
    </View>
  );
}

// ── Bottom save bar ─────────────────────────────────────────────

function SaveBar({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.saveBar, { backgroundColor: theme.screen }]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: theme.primary, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        ]}>
        <Text style={[styles.saveBtnText, { color: theme.onPrimary }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 1.4 },
  rowGap: { flexDirection: 'row', gap: 10 },
  mb14: { marginBottom: 14 },
  mb16: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },

  formContent: { paddingHorizontal: 24, paddingTop: Spacing.two, paddingBottom: 120 },

  // found
  foundContent: { paddingHorizontal: 22, paddingBottom: 120 },
  foundBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radii.sm,
  },
  foundBannerText: { fontSize: 13, fontWeight: '600' },
  resultCard: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
    padding: 18,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  resultMeta: { flex: 1, paddingTop: 2 },
  resultTitle: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  resultSub: { fontSize: 13, marginTop: 7, lineHeight: 22 },
  resultIsbn: { fontSize: 11, marginTop: 7 },

  // save bar
  saveBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  saveBtn: { borderRadius: Radii.lg, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' },

  // dark shell
  darkRoot: { flex: 1, backgroundColor: '#16100C', paddingTop: 52 },
  darkHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  closeX: { color: '#fff', fontSize: 22, fontWeight: '400' },
  darkHeaderTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  scanArea: { height: 520, backgroundColor: '#1B140E', justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 268, height: 172, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: '#E6B98C' },
  cornerActive: { borderColor: '#86C795' },
  tl: { left: 0, top: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  tr: { right: 0, top: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bl: { left: 0, bottom: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  br: { right: 0, bottom: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 },
  capturedBadge: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#86C795',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanHint: { position: 'absolute', bottom: 120, color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: '600' },
  scanSub: { position: 'absolute', bottom: 96, color: 'rgba(255,255,255,0.55)', fontSize: 12.5 },

  manualLinkWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 30 },
  manualLink: { color: '#E6B98C', fontSize: 15, fontWeight: '600' },

  centerDark: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  notFoundIcon: {
    width: 84,
    height: 84,
    borderRadius: 999,
    backgroundColor: 'rgba(230,185,140,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  permIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  darkTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  darkBody: { color: 'rgba(255,255,255,0.6)', fontSize: 13.5, lineHeight: 22, textAlign: 'center' },
  notFoundActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  outlineBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 22, paddingVertical: 12, borderRadius: Radii.md },
  outlineBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fillBtn: { backgroundColor: '#E6B98C', paddingHorizontal: 22, paddingVertical: 12, borderRadius: Radii.md },
  fillBtnText: { color: '#16100C', fontSize: 14, fontWeight: '700' },
  permLink: { color: '#E6B98C', fontSize: 13.5, fontWeight: '600', marginTop: 14 },
});
