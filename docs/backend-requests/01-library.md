# 백엔드 작업 요청서 #01 — 책장(Library)

> 프론트는 현재 로컬 스토어(`src/lib/store`)로 동작하며, 아래 계약이 준비되면
> `Repository`/`SyncEngine`(`src/lib/db`, `src/lib/sync`)을 통해 교체 연결한다.
> 백엔드는 **Supabase(Postgres + Auth + Storage)** 기준. 스키마 초안은
> `supabase/schema.sql` 참고.

## 1. 범위

책장 화면이 필요로 하는 읽기 경로만 다룬다.
- 내 도서 목록 조회 (상태 필터 · 정렬 · 페이지네이션)
- 상태별 권수 집계 (전체/읽고싶다/읽는중/완독)
- 표지 이미지 제공 (외부 URL 또는 Storage 경로)

쓰기(책 추가/수정), 구절·기록, 통계 집계는 별도 요청서에서 다룬다.

## 2. 인증/인가

- 로그인: **Apple / Google** OAuth (Supabase Auth). 클라이언트는 access token을 헤더로 전달.
- 모든 테이블 RLS: `user_id = auth.uid()` (스키마에 정의됨). 아래 모든 응답은 **현재 사용자 소유 행만** 반환.

## 3. 데이터 계약

DB는 `snake_case`, 클라이언트 모델은 `camelCase`(`src/types/models.ts`). 매핑 책임은 데이터 레이어(프론트)에서 처리하므로, 백엔드는 **DB 컬럼명 그대로** 반환하면 된다.

```jsonc
// books row (응답 항목)
{
  "id": "uuid",
  "isbn": "string|null",
  "title": "string",
  "author": "string",
  "publisher": "string|null",
  "cover_image_url": "string|null",
  "page_count": "int|null",
  "reading_status": "WANT | READING | DONE",
  "rating": "int(0..5)|null",
  "purchased_date": "date|null",
  "started_date": "date|null",
  "finished_date": "date|null",
  "memo": "string|null",
  "created_at": "timestamptz",
  "updated_at": "timestamptz",
  "tag_ids": ["uuid"]   // book_tags 조인 결과를 배열로 (아래 4.3 참고)
}
```

## 4. 엔드포인트 / 쿼리

PostgREST(자동 REST) 기준 스펙. 별도 게이트웨이를 둔다면 동일 의미로 매핑.

### 4.1 도서 목록

```
GET /rest/v1/books
  ?select=*,book_tags(tag_id)
  &reading_status=eq.{WANT|READING|DONE}      # 생략 시 전체
  &order={created_at.desc | title.asc | rating.desc.nullslast}
  &limit={pageSize}                            # 기본 30
  &offset={page*pageSize}
Authorization: Bearer <access_token>
```

- **필터**: `reading_status` 미지정 = 전체(ALL).
- **정렬**: `recent → created_at.desc`, `title → title.asc`(한글 콜레이션), `rating → rating.desc nullslast`.
- **페이지네이션**: `limit`/`offset` 또는 `Range` 헤더. 응답에 총 개수가 필요하면 `Prefer: count=exact` → `Content-Range` 헤더로 전달.
- **응답**: `200` `Book[]` (위 계약). `tag_ids`는 4.3 참고.

### 4.2 상태별 권수 (집계)

칩/카운트 행에서 4개 숫자가 필요. 클라이언트 다건 호출 방지를 위해 **RPC 권장**.

```sql
-- supabase RPC
create or replace function public.book_status_counts()
returns table(status text, count bigint)
language sql stable security invoker
as $$
  select reading_status::text, count(*)
  from public.books
  where user_id = auth.uid()
  group by reading_status;
$$;
```

```
POST /rest/v1/rpc/book_status_counts
→ 200 [{ "status": "WANT", "count": 4 }, { "status": "READING", "count": 3 }, ...]
```

전체(ALL)는 클라이언트에서 합산. (또는 `ALL` row 추가 반환해도 됨 — 택1, 알려줄 것.)

### 4.3 태그(N:M) 직렬화

`book_tags` 조인을 `tag_ids: uuid[]`로 평탄화해서 주면 프론트가 그대로 사용. PostgREST embed(`book_tags(tag_id)`)로 주면 프론트가 매핑하므로 **둘 중 편한 쪽** 가능. 결정 사항으로 표시.

### 4.4 표지 이미지

- 외부 표지 URL(알라딘/카카오)을 `cover_image_url`에 저장하는 것이 1순위.
- 사용자가 직접 올린 이미지는 Storage 버킷 `covers/{user_id}/{book_id}.jpg`, 공개 읽기 URL 또는 signed URL. (추가 화면 요청서에서 상세화)

## 5. 정렬·필터 의미 (수용 기준)

- [ ] 필터 없음 → 사용자의 모든 책 반환.
- [ ] `reading_status` 필터 → 해당 상태만.
- [ ] `title` 정렬은 한글 가나다(로케일 `ko`) 기준.
- [ ] `rating` 정렬에서 별점 없는 책은 마지막.
- [ ] 다른 사용자의 행은 절대 반환되지 않음(RLS 검증).
- [ ] 빈 결과는 `200 []`.

## 6. 에러

| 상황 | 코드 |
| --- | --- |
| 미인증/토큰 만료 | 401 |
| 권한 없음(RLS 위반 시도) | 403 또는 빈 결과 |
| 잘못된 정렬/필터 파라미터 | 400 |
| 서버 오류 | 5xx (프론트는 에러 상태 UI 표시) |

## 7. 프론트 연동 지점

- `BookshopRepository.load()` → 4.1 + 4.2 호출로 초기 스냅샷 구성.
- 정렬/필터는 **클라이언트 로컬 상태**라 매 변경마다 서버 호출은 불필요(로컬 캐시 정렬). 단 페이지네이션/대용량 시 서버 정렬 사용.
- `tag_ids` 매핑은 `src/lib/db`의 매퍼에서 처리 예정.

## 8. 열린 질문 (백엔드 결정 필요)

1. 권수 집계: RPC vs `Content-Range` 카운트 — 어느 쪽?
2. `tag_ids` 평탄화: 서버에서? 아니면 embed 그대로?
3. 페이지 크기 기본값(30 제안) 및 무한 스크롤 vs 페이지 — 정책?
4. 표지: 외부 URL 직접 저장 vs Storage 프록시 캐싱?
