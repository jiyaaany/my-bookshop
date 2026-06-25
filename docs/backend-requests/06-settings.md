# 백엔드 작업 요청서 #06 — 설정 / 계정 / 백업

> Supabase Auth + (선택) 동기화. 로그인은 **Apple / Google**.

## 1. 범위

- 인증: Apple / Google OAuth
- 사용자 환경설정 저장(연간 목표, 기본 정렬, 테마) — 기기 간 동기화
- 클라우드 백업/복원, 데이터 내보내기(CSV)

## 2. 인증 (Apple / Google)

- Supabase Auth Provider 설정(Apple, Google). 클라이언트는 `expo-apple-authentication` / `expo-auth-session`로 id_token 획득 → `supabase.auth.signInWithIdToken({ provider, token })`.
- 세션은 클라이언트에 안전 저장(`persistSession`), 자동 갱신.
- 신규 가입 시 `profiles` 행 생성 트리거 권장.

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  yearly_goal int not null default 30,
  default_sort text not null default 'recent',
  theme text not null default 'system',
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_owner on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
```

## 3. 환경설정 동기화

```
GET   /rest/v1/profiles?id=eq.{uid}&select=yearly_goal,default_sort,theme
PATCH /rest/v1/profiles?id=eq.{uid}  { "yearly_goal?": 30, "default_sort?": "recent", "theme?": "dark" }
```

- 현재 프론트는 `usePreferences()`(로컬). 로그인 시 `profiles`에서 로드/병합, 변경 시 PATCH.
- 비로그인(로컬 전용)도 계속 동작해야 함 → 동기화는 로그인 시에만 활성.

## 4. 백업 / 복원

- 전체 스냅샷(books/quotes/records/tags/book_tags)을 JSON으로 export/import.
- 옵션 A: 클라이언트가 각 테이블 select로 스냅샷 구성(RLS로 본인 데이터만).
- 옵션 B: RPC `export_snapshot()` → 단일 JSON. 복원 `import_snapshot(payload)`(업서트, 멱등).
- "마지막 백업 시각"은 `profiles.last_backup_at` 등으로 표기.

## 5. 데이터 내보내기 (CSV)

- 클라이언트에서 books(+조인) → CSV 생성 후 공유(`expo-sharing`) 가능 → **백엔드 불필요**.
- 서버 생성이 필요하면 RPC/Edge로 CSV 스트림 제공(선택).

## 6. 수용 기준

- [ ] Apple/Google 로그인으로 동일 계정 데이터 복원(기기 교체).
- [ ] 비로그인 시 로컬 전용으로 정상 동작.
- [ ] 환경설정 변경이 양방향 동기화(last-write-wins on updated_at).
- [ ] 백업/복원이 멱등(중복 생성 없음).

## 7. 프론트 연동 지점

- 설정 화면: 로그인 진입점, 연간 목표(시트)·기본 정렬·테마는 `usePreferences` ↔ `profiles` PATCH.
- "클라우드 백업"·"데이터 내보내기"·"로그아웃" 행이 위 기능에 연결될 자리(현재 "준비 중").

## 8. 열린 질문

1. 환경설정을 `profiles` 단일 행 vs 키-값 테이블?
2. 백업: 클라이언트 조합 vs RPC 스냅샷?
3. CSV: 클라이언트 생성(권장) vs 서버 생성?
4. 로그인 제공자 1차 출시 범위(Apple+Google 동시 vs 하나 먼저)?
