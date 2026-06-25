# Supabase 연동 셋업 런북

앱 측 연동 코드는 이미 들어가 있고(아래 "코드에 반영됨"), **콘솔/CLI 작업만 하면** 실데이터로 동작한다.

## 코드에 반영됨 (이 브랜치)
- `src/lib/supabase/client.ts` — RN용 클라이언트(`react-native-url-polyfill/auto`, `AsyncStorage` 세션 저장). env 없으면 자동 로컬 모드.
- `src/lib/supabase/mappers.ts` — row(snake_case) ↔ 모델 매핑.
- `src/lib/supabase/repository.ts` — `SupabaseRepository`(books/quotes/records/tags CRUD + book_tags 동기화, RLS 기반 user 스코프).
- `src/lib/store/bootstrap.ts` — 로그인 세션이 있으면 클라우드 스냅샷으로 store hydrate, 없으면 로컬 유지. `app/_layout.tsx`에서 시작 시 호출 + auth 변화 구독.
- `supabase/schema.sql` — 테이블/RLS + 트리거(`touch_reading_dates`, `updated_at`) + RPC(`book_status_counts`, `create_book_with_tags`) + `profiles`(가입 트리거) + Storage 버킷/정책.
- `.env` — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (gitignore).

## 콘솔/CLI 작업 (당신)

프로젝트 ref: `ueiaawyncnxogpyxsiqs`

### 1) 스키마 적용 — 둘 중 하나
- **대시보드**: SQL Editor에 `supabase/schema.sql` 전체 붙여넣기 → Run
- **CLI**:
  ```bash
  npm i -g supabase
  supabase login
  supabase link --project-ref ueiaawyncnxogpyxsiqs
  supabase db push        # 또는: supabase db execute -f supabase/schema.sql
  ```

### 2) 인증 Provider (Apple / Google)
- Dashboard → Authentication → Providers → **Apple**, **Google** 활성화
  - Google: GCP OAuth Client ID/Secret + redirect `https://ueiaawyncnxogpyxsiqs.supabase.co/auth/v1/callback`
  - Apple: Apple Developer Service ID/Key
- (앱 로그인 코드는 다음 브랜치에서 `expo-apple-authentication`/`expo-auth-session` + `signInWithIdToken`로 연결 예정)

### 3) ISBN 엣지 함수 + 키
```bash
supabase secrets set ALADIN_TTB_KEY=... KAKAO_REST_KEY=...
supabase functions deploy book-lookup
```
- 알라딘 TTBKey(상업 이용 범위 확인) + 카카오 REST key 발급 필요.

## 동작 확인
1. `.env` 채워진 상태로 로컬에서 `npx expo start`
2. 스키마 적용 후 로그인 구현 전까지는 RLS로 데이터가 비어 보임 → 로그인 붙이면 계정별 데이터 hydrate.
3. 미설정/오프라인 시에도 앱은 로컬 시드로 정상 동작(폴백).

## 다음 단계
- [ ] 로그인(Apple/Google) 화면/플로우 연결 → `bootstrapBookshop` 자동 hydrate 동작
- [ ] store 변경(addBook 등)을 `SupabaseRepository`로 write-through (낙관적 갱신 + 동기화)
- [ ] 표지/기록 이미지 Storage 업로드 연결
