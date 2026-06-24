@AGENTS.md

# 번잡한 책방 (My Bookshop)

1인용 독서 기록 앱 — 보유 도서를 책장처럼 기록하고, 읽은 책·구절·독후감을 남긴다.
컨셉: 나만의 작은 온라인 독립서점.

## Stack

- **Expo (managed) 56** + **React Native 0.85** + **React 19.2** + **TypeScript** (strict). React Compiler + typed routes are on (`app.json`).
- **Routing:** `expo-router` with a custom brown bottom tab bar (책장 / 통계 / 설정).
- **Styling:** typed design tokens + `StyleSheet` (NOT NativeWind — the bleeding-edge Expo 56 / RN 0.85 / React-Compiler stack makes NativeWind's transform a risk; tokens give the same tikitaka language with zero build risk).
- **State:** dependency-free observable store (`src/lib/store`, `useSyncExternalStore`).
- **Backend:** **Supabase** (Postgres + Auth + Storage). Login: **Apple + Google**. Sync is account-based for device migration.
- **Icons / charts:** `react-native-svg`.

> Expo 56 changed a lot — read https://docs.expo.dev/versions/v56.0.0/ before adding native code (see AGENTS.md).

## Design system — tikitaka · 브라운

Tokens live in `src/constants/theme.ts` (source of truth = the Claude Design handoff). The shipped tikitaka DS uses a blue primary, but the product screens override it with a warm brown palette — that brown is what's encoded here.

| token | light | dark |
| --- | --- | --- |
| `screen` | `#FAF5EF` | `#1A1411` |
| `surface` | `#FFFFFF` | `#231C18` |
| `surfaceMuted` | `#F1E6D9` | `#2C2420` |
| `border` | `#ECE0D2` | `#2C2420` |
| `primary` | `#A6603D` | `#A6603D` |
| `eyebrow` / accent | `#A6603D` | `#C98A5E` / `#D7A77E` |
| `heading` | `#2A211B` | `#F3EAE0` |
| `textSecondary` | `#9A8676` | `#8C7A6B` |
| `star` | `#D9A441` | `#E0B057` |

Also exported: `StatusColors` (WANT/READING/DONE badges), `GenrePalette`, `Spacing`, `Radii`, `Type`. Resolve theme with `useTheme()` / `useScheme()` (honors 설정 → 테마 override).

## Folder structure

```
src/
  app/                       # expo-router routes
    _layout.tsx              # root Stack + nav theme
    (tabs)/_layout.tsx       # custom tab bar (책장/통계/설정)
    (tabs)/index.tsx         # 책장 (home)
    (tabs)/stats.tsx         # 통계
    (tabs)/settings.tsx      # 설정
  components/
    icons.tsx                # svg line icons (from handoff)
    bookshop-tab-bar.tsx
    ui/                      # screen, section-card, status-badge, star-rating,
                             #   tag-chip, donut-progress, empty-state, ...
  constants/theme.ts         # design tokens
  features/<domain>/         # screen-specific logic (e.g. stats/use-reading-stats)
  hooks/                     # use-theme, use-color-scheme
  lib/
    store/                   # observable client store (single source of truth)
    db/                      # Repository contract + seed (local persistence seam)
    sync/                    # SyncEngine contract (cloud sync seam)
    supabase/                # supabase client (env-driven)
  types/models.ts            # Book / Quote / ReadingRecord / Tag
supabase/
  schema.sql                 # Postgres tables + RLS
  functions/book-lookup/     # Deno edge fn: Aladin→Kakao ISBN proxy
```

## Data model

`Book 1—N Quote`, `Book 1—N ReadingRecord`, `Book N—M Tag` (via `Book.tagIds`).
The "Record" entity is typed as **`ReadingRecord`** to avoid clashing with TS's built-in `Record<K,V>`. Dates are ISO strings.

## Secrets — NEVER commit

- `.env` is gitignored; document keys in `.env.example`.
- Client may hold ONLY `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (RLS protects data).
- **Aladin TTBKey / Kakao REST key live ONLY in the edge function** (`supabase secrets set ...`), never in the bundle.
- Never hardcode any key in source.

## Conventions

- Files: `kebab-case.tsx`. Components: `PascalCase`. Hooks: `useX`.
- Imports use the `@/` alias.
- Reusable pieces (badges, rating, chips, cover placeholder) go in `components/ui`.
- Every screen implements the states from the design: 기본 / 빈 상태 / 로딩 / 에러.
- Commits: imperative, scoped (e.g. `feat(stats): 통계 화면 구현`). Korean or English ok. Never commit secrets.

## Implementation order — all 7 screens done ✅

책장 ✅ → 책 상세 ✅ → 책 추가(스캔/직접입력) ✅ → 구절 추가/편집 ✅ → 기록 작성/편집 ✅ → 통계 ✅ → 설정 ✅.

Each screen was built on its own branch (`claude/<screen>`), stacked on the
previous, with a matching backend work-request in `docs/backend-requests/`.
Backend (Supabase) is spec'd but not implemented in this repo; the local store
is the seam (`src/lib/store`, `src/lib/db`, `src/lib/sync`).
