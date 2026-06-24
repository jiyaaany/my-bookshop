import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SectionCardProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

/** White surface card with the design's soft border + subtle shadow. */
export function SectionCard({ children, style, padded = true }: SectionCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        padded && styles.padded,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    // mirrors --tk-shadow-card; near-invisible on dark, intentional on light
    shadowColor: '#322012',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  padded: {
    padding: Spacing.four,
  },
});
