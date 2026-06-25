import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { useScheme } from '@/hooks/use-theme';
import { bootstrapBookshop, watchAuthChanges } from '@/lib/store/bootstrap';

export default function RootLayout() {
  const scheme = useScheme();

  useEffect(() => {
    // Hydrate from Supabase if configured + signed in; otherwise stays local.
    void bootstrapBookshop();
    return watchAuthChanges();
  }, []);

  // Must be a STABLE reference — a new theme object every render makes React
  // Navigation update on each render → "Maximum update depth exceeded" when a
  // Stack screen (e.g. book detail) is pushed.
  const navTheme = useMemo(() => {
    const palette = Colors[scheme];
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.screen,
        card: palette.surface,
        text: palette.text,
        border: palette.border,
        primary: palette.primary,
      },
    };
  }, [scheme]);

  return (
    <ThemeProvider value={navTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
