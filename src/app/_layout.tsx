import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

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
  const palette = Colors[scheme];

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
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

  return (
    <ThemeProvider value={navTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
