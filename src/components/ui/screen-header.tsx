import { StyleSheet, Text, View } from 'react-native';

import { Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenHeaderProps {
  /** Small uppercase label above the title (e.g. "2024", "MY BOOKSHOP"). */
  eyebrow?: string;
  title: string;
}

export function ScreenHeader({ eyebrow, title }: ScreenHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: theme.eyebrow }]}>{eyebrow}</Text>
      ) : null}
      <Text style={[styles.title, { color: theme.heading }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  eyebrow: {
    ...Type.eyebrow,
    marginBottom: 3,
  },
  title: Type.h1,
});
