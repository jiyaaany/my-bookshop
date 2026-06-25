import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onPress?: () => void; icon?: ReactNode };
  /** 'solid' = filled brown CTA; 'soft' = tinted pill (matches the two mocks). */
  actionVariant?: 'solid' | 'soft';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionVariant = 'soft',
}: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.surfaceMuted }]}>{icon}</View>
      <Text style={[styles.title, { color: theme.heading }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.action,
            actionVariant === 'solid'
              ? { backgroundColor: theme.primary }
              : { backgroundColor: theme.surfaceMuted },
            pressed && styles.pressed,
          ]}>
          {action.icon}
          <Text
            style={[
              styles.actionLabel,
              { color: actionVariant === 'solid' ? theme.onPrimary : theme.primary },
            ]}>
            {action.label}
          </Text>
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
