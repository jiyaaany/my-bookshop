/**
 * Theme resolution.
 *
 * Resolves to 'light' | 'dark' from the device color scheme, overridden by the
 * user's saved preference (설정 → 테마). `useTheme()` returns the active palette;
 * `useScheme()` returns the resolved scheme name (needed for StatusColors etc.).
 *
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ColorScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePreferences } from '@/lib/store/bookshop-store';

export function useScheme(): ColorScheme {
  const device = useColorScheme();
  const { theme } = usePreferences();
  if (theme === 'light' || theme === 'dark') return theme;
  return device === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useScheme()];
}
