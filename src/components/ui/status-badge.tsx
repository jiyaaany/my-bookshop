import { StyleSheet, Text, View } from 'react-native';

import { Radii, StatusColors } from '@/constants/theme';
import { useScheme } from '@/hooks/use-theme';
import { READING_STATUS_LABEL, type ReadingStatus } from '@/types/models';

interface StatusBadgeProps {
  status: ReadingStatus;
  /** 'pill' for the cover overlay, 'inline' for list rows. */
  size?: 'pill' | 'inline';
}

/** Reading-status pill (읽고 싶다 / 읽는 중 / 완독) with themed colors. */
export function StatusBadge({ status, size = 'pill' }: StatusBadgeProps) {
  const scheme = useScheme();
  const colors = StatusColors[scheme][status];
  return (
    <View style={[styles.badge, size === 'inline' && styles.inline, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.fg }]}>{READING_STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  inline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});
