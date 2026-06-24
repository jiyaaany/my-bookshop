import { ScrollView, StyleSheet, View } from 'react-native';

import { SettingsIcon } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useTheme } from '@/hooks/use-theme';

/**
 * 설정 — placeholder.
 * The yearly-goal sheet, theme toggle, sync/backup and export rows land in a
 * later per-screen pass; preferences already live in the store.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <ScreenHeader title="설정" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.fill}>
          <EmptyState
            icon={<SettingsIcon size={48} color={theme.primary} />}
            title="설정 화면 준비 중"
            description="연간 목표 · 테마 · 클라우드 백업 · 데이터 내보내기를 곧 구현해요."
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
