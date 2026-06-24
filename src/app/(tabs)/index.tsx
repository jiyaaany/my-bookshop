import { ScrollView, StyleSheet, View } from 'react-native';

import { OpenBookIcon } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useTheme } from '@/hooks/use-theme';

/**
 * 책장 (홈) — placeholder.
 * Foundation is in place (theme, models, store, shared components); the full
 * grid + status filters + FAB land in the next per-screen pass.
 */
export default function LibraryScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <ScreenHeader eyebrow="MY BOOKSHELF" title="번잡한 책방" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.fill}>
          <EmptyState
            icon={<OpenBookIcon size={56} color={theme.primary} />}
            title="책장 화면 준비 중"
            description="다음 단계에서 표지 그리드 · 상태 필터 · 책 추가(FAB)를 구현해요."
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1 },
  fill: { flex: 1, minHeight: 480 },
});
