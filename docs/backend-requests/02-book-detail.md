# 백엔드 작업 요청서 #02 — 책 상세(Book Detail)

> Supabase 기준. 스키마: `supabase/schema.sql`. 공통 인증/RLS는 #01 참고.

## 1. 범위

- 책 1건 + 연결된 구절/기록/태그 조회
- 읽기 상태 변경(읽고싶다/읽는중/완독) — 상태 전환 시 시작일/완독일 자동 세팅
- 책 삭제(연결된 구절/기록 cascade)

## 2. 엔드포인트

### 2.1 상세 조회 (1회 호출로 임베드)

```
GET /rest/v1/books?id=eq.{id}&select=*,quotes(*),records(*),book_tags(tag_id,tags(name))
→ 200 단건(배열 첫 항목)
```

- `quotes`, `records`는 1:N 임베드. 정렬: 구절 `created_at.desc`, 기록 `updated_at.desc` (임베드 정렬 파라미터 또는 클라이언트 정렬).
- 태그는 `book_tags→tags(name)` 임베드. 프론트는 `tag_ids` + 이름 맵으로 사용.

### 2.2 상태 변경

```
PATCH /rest/v1/books?id=eq.{id}
Body: { "reading_status": "DONE" }
```

- **트리거 권장**: `reading_status`가 `READING`으로 바뀌고 `started_date`가 null이면 `now()`; `DONE`으로 바뀌고 `finished_date`가 null이면 `now()`로 세팅. (프론트도 동일 로직을 낙관적 적용 중 — 서버 트리거가 최종 권위.)

```sql
create or replace function public.touch_reading_dates()
returns trigger language plpgsql as $$
begin
  if new.reading_status = 'READING' and new.started_date is null then
    new.started_date := current_date;
  end if;
  if new.reading_status = 'DONE' and new.finished_date is null then
    new.finished_date := current_date;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger trg_touch_reading_dates before update on public.books
for each row execute function public.touch_reading_dates();
```

### 2.3 삭제

```
DELETE /rest/v1/books?id=eq.{id}
```

- `quotes`, `records`, `book_tags`는 FK `on delete cascade`로 자동 정리(스키마에 정의됨).

## 3. 응답 계약

`books` 행(#01과 동일) + 임베드:
```jsonc
{
  "...": "books fields",
  "quotes":  [{ "id", "book_id", "text", "page_number", "created_at" }],
  "records": [{ "id", "book_id", "title", "body", "created_at", "updated_at" }],
  "book_tags": [{ "tag_id", "tags": { "name": "소설" } }]
}
```

## 4. 수용 기준

- [ ] 본인 책만 조회/수정/삭제 (RLS).
- [ ] 상태 변경 시 날짜 자동 세팅이 트리거로 보장됨.
- [ ] 삭제 시 구절/기록/태그연결이 함께 제거됨.
- [ ] 존재하지 않는 id → 빈 결과(404 대신 `[]`).

## 5. 프론트 연동 지점

- `BookshopRepository.upsertBook` ← 상태 변경(PATCH).
- `BookshopRepository.deleteBook` ← 삭제.
- 상세 진입 시 2.1로 단건+임베드 로드 → store 갱신.

## 6. 열린 질문

1. 상태 변경을 PATCH 직접 vs RPC(`set_reading_status`)로 감쌀지?
2. 임베드 정렬을 서버에서 보장할지, 프론트 정렬로 둘지?
