import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useScheme, useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: ReactNode;
  /** Safe-area edges to apply. Defaults to top only (tab bar handles bottom). */
  edges?: Edge[];
}

/** Brown-themed screen container with safe-area + matching status bar. */
export function Screen({ children, edges = ['top'] }: ScreenProps) {
  const theme = useTheme();
  const scheme = useScheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.screen }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
});
