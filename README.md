# 번잡한 책방 (My Bookshop) 📚

1인용 독서 기록 앱 — 보유 도서를 책장처럼 기록하고, 읽은 책·인상 깊은 구절·독후감을 남긴다.
컨셉: **나만의 작은 온라인 독립서점.**

> 디자인: Claude Design의 tikitaka 디자인 시스템 + 브라운 테마. 자세한 규칙은 [`CLAUDE.md`](./CLAUDE.md) 참고.

## 기능

- **책장(홈)** — 표지 그리드, 상태 필터(읽고싶다/읽는중/완독), 정렬, 검색(제목·저자·태그), FAB
- **책 추가** — 바코드(ISBN) 스캔 → 도서 정보 자동 채움(알라딘→카카오 프록시) · 직접 입력 fallback
- **책 상세 / 편집** — 상태·별점·기간·태그·메모, 연결된 구절·기록, 편집/삭제
- **구절 / 기록** — 구절(쪽수) 작성·편집, 기록(제목·본문·이미지) 작성·편집
- **통계** — 연간 목표 도넛, 월별 완독, 장르 분포
- **설정** — 연간 목표, 테마(라이트/다크), 정렬, 로그인/동기화
- 모든 화면 **라이트/다크 + 빈/로딩/에러** 상태 지원

## 스택

| 영역 | 사용 |
| --- | --- |
| 런타임 | Expo (managed) 56 · React Native 0.85 · React 19.2 · TypeScript(strict) |
| 라우팅 | expo-router (커스텀 브라운 하단 탭) |
| 스타일 | 타입드 디자인 토큰 + StyleSheet (`src/constants/theme.ts`) |
| 상태 | 의존성 없는 옵저버블 스토어 (`useSyncExternalStore`) |
| 백엔드 | Supabase (Postgres + Auth + Storage), Google 로그인 |
| 그래픽 | react-native-svg |

## 시작하기

```bash
npm install

# 클라우드 동기화/로그인을 쓰려면 .env 생성 (없어도 로컬 시드로 동작)
cp .env.example .env
#   EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY 채우기

npx expo start            # 개발 서버 (캐시 이슈 시 -c)
npx expo run:ios          # 네이티브 dev build (카메라/딥링크 로그인 테스트용)
npx expo run:android
```

> 바코드 스캔(expo-camera)·소셜 로그인 딥링크는 **Expo Go가 아닌 dev build**에서 동작합니다.

## 백엔드(Supabase) 세팅

스키마·트리거·RPC·Storage 정책은 [`supabase/schema.sql`](./supabase/schema.sql) 한 파일에 정리돼 있고,
콘솔/CLI 절차는 [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md)에 있습니다. 화면별 API 스펙은
[`docs/backend-requests/`](./docs/backend-requests)를 참고하세요.

```bash
supabase link --project-ref <ref>
supabase db push                      # 스키마 적용
supabase secrets set ALADIN_TTB_KEY=... KAKAO_REST_KEY=...
supabase functions deploy book-lookup # ISBN 조회 프록시
```

## 폴더 구조

```
src/
  app/                 # expo-router 라우트 (탭 + book/quote/record)
  components/ui/        # 공통 컴포넌트(badge, rating, cover, ...)
  constants/theme.ts    # 디자인 토큰(브라운)
  features/<domain>/    # 화면 로직(library, stats, books, auth)
  lib/store, db, sync, supabase/   # 상태 + 영속/동기화 seam
  types/models.ts       # Book / Quote / ReadingRecord / Tag
supabase/               # schema.sql + book-lookup 엣지 함수
docs/                   # 백엔드 요청서 + 세팅 가이드
```

## 시크릿

`.env`는 gitignore. 클라이언트엔 **Supabase URL + anon 키만** (RLS로 보호). 알라딘/카카오 키는
**엣지 함수 환경변수에만** 두고 번들에 넣지 않습니다.
