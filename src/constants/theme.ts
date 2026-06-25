/**
 * 번잡한 책방 — Design tokens
 *
 * Source of truth: the Claude Design "tikitaka · 브라운" handoff (HTML mockups).
 * The shipped tikitaka DS package uses a blue primary, but the product screens
 * override it with a warm brown palette — those screen values are reproduced here.
 *
 * NOTE: Legacy keys (`text`, `textSecondary`, `background`, `backgroundElement`,
 * `backgroundSelected`) are kept so the template's ThemedText/ThemedView keep working.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // ── legacy keys (kept for ThemedText / ThemedView) ──
    text: '#2A211B',
    textSecondary: '#9A8676',
    background: '#FAF5EF',
    backgroundElement: '#F1E6D9',
    backgroundSelected: '#ECE0D2',

    // ── surfaces ──
    screen: '#FAF5EF',
    surface: '#FFFFFF',
    surfaceMuted: '#F1E6D9',
    surfaceSunken: '#F7EFE5',
    border: '#ECE0D2',
    borderSoft: '#F2E9DD',

    // ── brand ──
    primary: '#A6603D',
    primaryGradientEnd: '#7A4527',
    onPrimary: '#FFFFFF',
    eyebrow: '#A6603D',
    accent: '#A6603D',

    // ── text ──
    heading: '#2A211B',
    textTertiary: '#7A6453',

    // ── accents ──
    star: '#D9A441',
    destructive: '#C0654C',
    success: '#3E6B45',
    successBg: '#E4F0E5',

    // ── navigation ──
    tabBarBg: 'rgba(255,252,248,0.94)',
    tabBarBorder: '#ECE0D2',
    tabActive: '#A6603D',
    tabInactive: '#B6A493',

    // ── skeleton shimmer ──
    skeletonBase: '#EFE5D8',
    skeletonHighlight: '#F7EFE5',

    // device-frame chrome (storybook / previews only)
    frame: '#2A211B',
  },
  dark: {
    // ── legacy keys ──
    text: '#F3EAE0',
    textSecondary: '#8C7A6B',
    background: '#1A1411',
    backgroundElement: '#2C2420',
    backgroundSelected: '#3A2E25',

    // ── surfaces ──
    screen: '#1A1411',
    surface: '#231C18',
    surfaceMuted: '#2C2420',
    surfaceSunken: '#221B17',
    border: '#2C2420',
    borderSoft: '#2C2420',

    // ── brand ──
    primary: '#A6603D',
    primaryGradientEnd: '#7A4527',
    onPrimary: '#FFFFFF',
    eyebrow: '#C98A5E',
    accent: '#D7A77E',

    // ── text ──
    heading: '#F3EAE0',
    textTertiary: '#A9947F',

    // ── accents ──
    star: '#E0B057',
    destructive: '#D98162',
    success: '#7FC08C',
    successBg: '#22332A',

    // ── navigation ──
    tabBarBg: 'rgba(20,16,13,0.92)',
    tabBarBorder: '#2C2420',
    tabActive: '#D7A77E',
    tabInactive: '#6E5F52',

    // ── skeleton shimmer ──
    skeletonBase: '#2C2420',
    skeletonHighlight: '#3A2E25',

    frame: '#0E0A08',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ColorScheme = keyof typeof Colors;

/** Reading-status badge colors (light / dark) — keyed by ReadingStatus. */
export const StatusColors = {
  light: {
    WANT: { bg: '#EFE0C9', fg: '#9A6B1E' },
    READING: { bg: '#DCEBDD', fg: '#3E6B45' },
    DONE: { bg: '#EFD9CC', fg: '#9C4A2E' },
  },
  dark: {
    WANT: { bg: '#3A3120', fg: '#E0B964' },
    READING: { bg: '#22332A', fg: '#7FC08C' },
    DONE: { bg: '#3A271F', fg: '#E29270' },
  },
} as const;

/** Ordered palette for genre / tag distribution bars. */
export const GenrePalette = ['#A6603D', '#C2895F', '#8C6B4A', '#D0A878', '#B5915F'] as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    // Pretendard ships with the design system; load it via web CSS when wired.
    sans: "'Pretendard', var(--font-display, system-ui), sans-serif",
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** 4-based spacing scale (matches tikitaka --tk-space-*). */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
} as const;

/** Corner radii (matches tikitaka --tk-radius-*). */
export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 24,
  full: 999,
} as const;

/** Typography scale used across screens (size + weight). */
export const Type = {
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.6 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  sectionTitle: { fontSize: 13.5, fontWeight: '700' },
  listTitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  bodyStrong: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 12.5, fontWeight: '400' },
  label: { fontSize: 12, fontWeight: '600' },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
