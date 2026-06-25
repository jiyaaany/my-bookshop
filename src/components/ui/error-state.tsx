import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CloudOffIcon, RefreshIcon } from '@/components/icons';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Retry handler — when set, renders the "다시 시도" CTA. */
  onRetry?: () => void;
  /** Custom illustration; defaults to a cloud-off (failed sync) icon. */
  icon?: ReactNode;
}

/**
 * Full-screen load/network failure state. Mirrors EmptyState's layout but uses a
 * destructive-tinted illustration and a retry CTA.
 */
export function ErrorState({
  title = '불러오지 못했어요',
  description = '네트워크 상태를 확인하고 다시 시도해 주세요.',
  onRetry,
  icon,
}: ErrorStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.surfaceMuted }]}>
        {icon ?? <CloudOffIcon size={52} color={theme.destructive} />}
      </View>
      <Text style={[styles.title, { color: theme.heading }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: theme.surfaceMuted },
            pressed && styles.pressed,
          ]}>
          <RefreshIcon size={17} color={theme.primary} strokeWidth={2.2} />
          <Text style={[styles.actionLabel, { color: theme.primary }]}>다시 시도</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  iconCircle: {
    width: 118,
    height: 118,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.six,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.six,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 22,
    paddingVertical: Spacing.three,
    borderRadius: Radii.md,
  },
  actionLabel: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  pressed: { opacity: 0.85 },
});
