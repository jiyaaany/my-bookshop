import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarChartBaseIcon } from '@/components/icons';
import { DonutProgress } from '@/components/ui/donut-progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionCard } from '@/components/ui/section-card';
import { Radii, Spacing } from '@/constants/theme';
import { useReadingStats, type ReadingStats } from '@/features/stats/use-reading-stats';
import { useScheme, useTheme } from '@/hooks/use-theme';

const SCREEN_PAD = 22;
const CHART_HEIGHT = 96;

export default function StatsScreen() {
  const stats = useReadingStats();

  return (
    <Screen>
      <ScreenHeader eyebrow={String(stats.year)} title="독서 통계" />
      {stats.hasData ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GoalCard stats={stats} />
          <SummaryRow stats={stats} />
          <MonthlyCard stats={stats} />
          <GenreCard stats={stats} />
        </ScrollView>
      ) : (
        <View style={styles.emptyFill}>
          <EmptyState
            icon={<BarChartBaseIcon size={52} color="#BC8460" />}
            title="기록이 쌓이면 통계가 보여요"
            description={'책을 완독하고 별점을 남기면\n월별 추이와 장르 분포가 채워져요.'}
            action={{ label: '책장으로 가기', onPress: () => router.navigate('/') }}
          />
        </View>
      )}
    </Screen>
  );
}

// ── Goal progress card ──────────────────────────────────────────

function GoalCard({ stats }: { stats: ReadingStats }) {
  const theme = useTheme();
  const month = new Date().getMonth();
  const thisMonth = stats.monthly[month]?.count ?? 0;
  const line1 =
    stats.remaining > 0 ? `목표까지 ${stats.remaining}권 남았어요.` : '올해 목표를 달성했어요! 🎉';
  const line2 =
    thisMonth > 0 ? `이번 달에는 ${thisMonth}권 읽었어요.` : '이번 달 첫 책을 완독해 볼까요?';

  return (
    <SectionCard padded={false} style={styles.goalCard}>
      <DonutProgress
        progress={stats.completedThisYear / stats.goal}
        color={theme.eyebrow}
        trackColor={theme.surfaceMuted}>
        <Text style={[styles.donutNumber, { color: theme.heading }]}>{stats.completedThisYear}</Text>
        <Text style={[styles.donutSub, { color: theme.textSecondary }]}>/ {stats.goal}권</Text>
      </DonutProgress>
      <View style={styles.goalText}>
        <Text style={[styles.goalLabel, { color: theme.textSecondary }]}>올해 완독</Text>
        <Text style={[styles.goalPercent, { color: theme.heading }]}>목표의 {stats.goalPercent}%</Text>
        <Text style={[styles.goalNote, { color: theme.textTertiary }]}>
          {stats.remaining > 0 ? (
            <>
              목표까지 <Text style={{ color: theme.accent, fontWeight: '700' }}>{stats.remaining}권</Text> 남았어요.
            </>
          ) : (
            line1
          )}
          {'\n'}
          {line2}
        </Text>
      </View>
    </SectionCard>
  );
}

// ── Two-up summary (reading / quotes) ───────────────────────────

function SummaryRow({ stats }: { stats: ReadingStats }) {
  const theme = useTheme();
  return (
    <View style={styles.summaryRow}>
      <SectionCard style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>읽는 중</Text>
        <Text style={[styles.summaryNumber, { color: theme.success }]}>
          {stats.readingCount}
          <Text style={[styles.summaryUnit, { color: theme.textSecondary }]}>권</Text>
        </Text>
      </SectionCard>
      <SectionCard style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>누적 구절</Text>
        <Text style={[styles.summaryNumber, { color: theme.accent }]}>
          {stats.totalQuotes}
          <Text style={[styles.summaryUnit, { color: theme.textSecondary }]}>개</Text>
        </Text>
      </SectionCard>
    </View>
  );
}

// ── Monthly completed bar chart ─────────────────────────────────

function MonthlyCard({ stats }: { stats: ReadingStats }) {
  const theme = useTheme();
  return (
    <SectionCard padded={false} style={styles.chartCard}>
      <Text style={[styles.cardTitle, { color: theme.heading }]}>월별 완독</Text>
      <View style={styles.bars}>
        {stats.monthly.map((m) => {
          const h = m.count === 0 ? 4 : Math.round(8 + (m.count / stats.monthlyMax) * 84);
          return (
            <View key={m.label} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  { height: h, backgroundColor: m.count === 0 ? theme.skeletonBase : theme.eyebrow },
                ]}
              />
              <Text style={[styles.barLabel, { color: theme.tabInactive }]}>{m.label}</Text>
            </View>
          );
        })}
      </View>
    </SectionCard>
  );
}

// ── Genre distribution ──────────────────────────────────────────

function GenreCard({ stats }: { stats: ReadingStats }) {
  const theme = useTheme();
  const scheme = useScheme();
  const nameColor = scheme === 'dark' ? '#D8C8B8' : '#4A3B2E';
  return (
    <SectionCard padded={false} style={styles.chartCard}>
      <Text style={[styles.cardTitle, { color: theme.heading }]}>장르 분포</Text>
      <View style={styles.genreList}>
        {stats.genres.map((g) => (
          <View key={g.name} style={styles.genreRow}>
            <Text style={[styles.genreName, { color: nameColor }]} numberOfLines={1}>
              {g.name}
            </Text>
            <View style={[styles.genreTrack, { backgroundColor: theme.surfaceMuted }]}>
              <View
                style={[
                  styles.genreFill,
                  { width: `${Math.round(g.share * 100)}%`, backgroundColor: g.color },
                ]}
              />
            </View>
            <Text style={[styles.genreCount, { color: theme.textSecondary }]}>{g.count}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_PAD,
    paddingBottom: 120,
    gap: Spacing.four,
  },
  emptyFill: { flex: 1, paddingBottom: 80 },

  // goal card
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.five,
    padding: 20,
    borderRadius: Radii.xl,
  },
  donutNumber: { fontSize: 28, fontWeight: '800', lineHeight: 30 },
  donutSub: { fontSize: 11, marginTop: 2 },
  goalText: { flex: 1 },
  goalLabel: { fontSize: 13, marginBottom: 4 },
  goalPercent: { fontSize: 20, fontWeight: '800', letterSpacing: -0.2 },
  goalNote: { fontSize: 12.5, marginTop: 8, lineHeight: 19 },

  // summary
  summaryRow: { flexDirection: 'row', gap: Spacing.three },
  summaryCard: { flex: 1, padding: Spacing.four },
  summaryLabel: { fontSize: 12, marginBottom: 8 },
  summaryNumber: { fontSize: 26, fontWeight: '800' },
  summaryUnit: { fontSize: 14, fontWeight: '600' },

  // charts
  chartCard: { padding: 18 },
  cardTitle: { fontSize: 13.5, fontWeight: '700', marginBottom: 16 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT,
    gap: 5,
  },
  barColumn: { flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', maxWidth: 16, borderRadius: 4 },
  barLabel: { fontSize: 9 },

  // genres
  genreList: { gap: 11 },
  genreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  genreName: { fontSize: 12.5, width: 54 },
  genreTrack: { flex: 1, height: 9, borderRadius: Radii.full, overflow: 'hidden' },
  genreFill: { height: '100%', borderRadius: Radii.full },
  genreCount: { fontSize: 11.5, fontWeight: '600', width: 26, textAlign: 'right' },
});
