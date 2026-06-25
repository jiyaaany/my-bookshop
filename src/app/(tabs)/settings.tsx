import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  ClockIcon,
  CloudIcon,
  DownloadIcon,
  LogOutIcon,
  SortIcon,
  SunIcon,
  ChevronRightIcon,
} from '@/components/icons';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Radii, Spacing } from '@/constants/theme';
import { SORT_CYCLE, SORT_LABEL } from '@/features/library/use-library';
import { useScheme, useTheme } from '@/hooks/use-theme';
import { setPreferences, setYearlyGoal, usePreferences } from '@/lib/store/bookshop-store';

const PAD = 22;

export default function SettingsScreen() {
  const theme = useTheme();
  const scheme = useScheme();
  const prefs = usePreferences();
  const [goalOpen, setGoalOpen] = useState(false);

  const cycleSort = () =>
    setPreferences({ defaultSort: SORT_CYCLE[(SORT_CYCLE.indexOf(prefs.defaultSort) + 1) % SORT_CYCLE.length] });

  const soon = () => Alert.alert('준비 중', '이 기능은 곧 제공돼요.');

  return (
    <Screen>
      <ScreenHeader title="설정" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[styles.profile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>책</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { color: theme.heading }]}>내 책방</Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>로그인하면 기기 간 동기화돼요</Text>
          </View>
          <View style={[styles.syncBadge, { backgroundColor: theme.surfaceMuted }]}>
            <Text style={[styles.syncText, { color: theme.textSecondary }]}>로컬 저장</Text>
          </View>
        </View>

        {/* 독서 */}
        <Section label="독서">
          <Row
            icon={<ClockIcon size={20} color={theme.primary} />}
            label="연간 독서 목표"
            value={`${prefs.yearlyGoal}권`}
            onPress={() => setGoalOpen(true)}
          />
          <Row
            icon={<SortIcon size={20} color={theme.primary} />}
            label="기본 정렬"
            value={SORT_LABEL[prefs.defaultSort]}
            onPress={cycleSort}
            last
          />
        </Section>

        {/* 화면 */}
        <Section label="화면">
          <Row
            icon={<SunIcon size={20} color={theme.primary} />}
            label="테마"
            last
            right={
              <View style={[styles.segment, { backgroundColor: theme.surfaceMuted }]}>
                {(['light', 'dark'] as const).map((opt) => {
                  const selected = scheme === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setPreferences({ theme: opt })}
                      style={[styles.segmentItem, selected && { backgroundColor: theme.primary }]}>
                      <Text
                        style={[
                          styles.segmentText,
                          { color: selected ? theme.onPrimary : theme.textSecondary },
                        ]}>
                        {opt === 'light' ? '라이트' : '다크'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            }
          />
        </Section>

        {/* 데이터 */}
        <Section label="데이터">
          <Row
            icon={<CloudIcon size={20} color={theme.primary} />}
            label="클라우드 백업"
            value="로컬 전용"
            onPress={soon}
          />
          <Row
            icon={<DownloadIcon size={20} color={theme.primary} />}
            label="데이터 내보내기"
            value="CSV"
            onPress={soon}
            last
          />
        </Section>

        <Pressable onPress={soon} style={styles.logout} accessibilityRole="button">
          <LogOutIcon size={18} color={theme.destructive} />
          <Text style={[styles.logoutText, { color: theme.destructive }]}>로그아웃</Text>
        </Pressable>
      </ScrollView>

      <GoalSheet
        visible={goalOpen}
        initial={prefs.yearlyGoal}
        onClose={() => setGoalOpen(false)}
        onSave={(g) => {
          setYearlyGoal(g);
          setGoalOpen(false);
        }}
      />
    </Screen>
  );
}

// ── Section + Row ───────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.eyebrow }]}>{label}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  right,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
        pressed && onPress && styles.pressed,
      ]}>
      {icon}
      <Text style={[styles.rowLabel, { color: theme.heading }]}>{label}</Text>
      {right ?? (
        <>
          {value ? <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text> : null}
          {onPress ? <ChevronRightIcon size={18} color={theme.tabInactive} /> : null}
        </>
      )}
    </Pressable>
  );
}

// ── Goal bottom sheet ───────────────────────────────────────────

function GoalSheet({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: number;
  onClose: () => void;
  onSave: (goal: number) => void;
}) {
  const theme = useTheme();
  const [goal, setGoal] = useState(initial);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={() => setGoal(initial)}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.surfaceSunken }]}>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />
        <Text style={[styles.sheetTitle, { color: theme.heading }]}>연간 독서 목표</Text>
        <Text style={[styles.sheetSub, { color: theme.textSecondary }]}>올해 몇 권을 완독해 볼까요?</Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setGoal((g) => Math.max(1, g - 1))}
            style={[styles.stepBtn, { borderColor: theme.border }]}>
            <Text style={[styles.stepSign, { color: theme.accent }]}>−</Text>
          </Pressable>
          <View style={styles.goalValue}>
            <Text style={[styles.goalNumber, { color: theme.heading }]}>{goal}</Text>
            <Text style={[styles.goalUnit, { color: theme.textSecondary }]}> 권</Text>
          </View>
          <Pressable onPress={() => setGoal((g) => g + 1)} style={[styles.stepBtn, { backgroundColor: theme.primary }]}>
            <Text style={[styles.stepSign, { color: theme.onPrimary }]}>+</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => onSave(goal)}
          style={({ pressed }) => [styles.sheetSave, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
          <Text style={[styles.sheetSaveText, { color: theme.onPrimary }]}>저장</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: PAD,
    marginBottom: 18,
    padding: 16,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  avatar: { width: 48, height: 48, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  profileMeta: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700' },
  profileEmail: { fontSize: 12.5, marginTop: 2 },
  syncBadge: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: Radii.full },
  syncText: { fontSize: 12, fontWeight: '600' },

  section: { marginBottom: 18 },
  sectionLabel: { fontSize: 12, fontWeight: '600', paddingHorizontal: PAD + 2, marginBottom: 8 },
  sectionCard: { marginHorizontal: PAD, borderWidth: 1, borderRadius: Radii.lg, overflow: 'hidden' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 15 },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.7 },

  segment: { flexDirection: 'row', borderRadius: Radii.full, padding: 3, gap: 3 },
  segmentItem: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: Radii.full },
  segmentText: { fontSize: 12.5, fontWeight: '600' },

  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 4 },
  logoutText: { fontSize: 14.5, fontWeight: '600' },

  backdrop: { flex: 1, backgroundColor: 'rgba(10,7,5,0.55)' },
  sheet: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 32, borderTopLeftRadius: Radii.xxl, borderTopRightRadius: Radii.xxl },
  handle: { width: 40, height: 4, borderRadius: Radii.full, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 19, fontWeight: '800', textAlign: 'center', letterSpacing: -0.2 },
  sheetSub: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginVertical: 26 },
  stepBtn: { width: 46, height: 46, borderRadius: Radii.full, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepSign: { fontSize: 24, fontWeight: '500', lineHeight: 28 },
  goalValue: { flexDirection: 'row', alignItems: 'baseline' },
  goalNumber: { fontSize: 46, fontWeight: '800', letterSpacing: -0.5 },
  goalUnit: { fontSize: 16, fontWeight: '600' },
  sheetSave: { borderRadius: Radii.lg, paddingVertical: 15, alignItems: 'center' },
  sheetSaveText: { fontSize: 16, fontWeight: '700' },
});
