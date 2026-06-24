# 백엔드 작업 요청서 #03 — 책 추가 / ISBN 조회

> 핵심: **API 키를 클라이언트에 절대 노출하지 않는다.** 알라딘/카카오 키는
> Supabase Edge Function 환경변수에만 둔다. 함수 스켈레톤:
> `supabase/functions/book-lookup/index.ts`.

## 1. 범위

- ISBN으로 도서 메타데이터 조회 (표지·제목·저자·출판사·쪽수)
- 조회 결과 또는 수동 입력으로 책 생성(쓰기)
- 태그 생성/연결

## 2. ISBN 조회 — Edge Function (프록시)

```
GET {SUPABASE_URL}/functions/v1/book-lookup?isbn={isbn13}
Authorization: Bearer {anon_key}
```

**서버 처리 순서**
1. `isbn` 정규화(숫자/X만).
2. **알라딘 ItemLookUp** (`itemIdType=ISBN13`, `output=js`) 우선.
3. 실패/미발견 시 **카카오 책 검색 v3**(`target=isbn`) 폴백.
4. 정규화 응답 반환.

**응답 계약** (`BookMeta`, `src/features/books/book-lookup.ts`와 일치)
```jsonc
{ "isbn", "title", "author", "publisher?", "coverImageUrl?", "pageCount?", "source": "aladin|kakao" }
```
- 미발견: `404 { "error": "not found" }` → 프론트는 수동 입력으로 폴백.
- 키 미설정/상류 오류: `5xx`. 프론트는 동일하게 폴백.

**시크릿**
```
supabase secrets set ALADIN_TTB_KEY=... KAKAO_REST_KEY=...
```

**필요 결정**: 표지 이미지를 외부 URL 그대로 둘지, Storage로 복제(핫링크/만료 방지)할지.

## 3. 책 생성 (쓰기)

```
POST /rest/v1/books
Body(snake_case): { title, author, publisher?, page_count?, isbn?, cover_image_url?, reading_status }
→ 201 { id, ... }   # user_id는 RLS/default auth.uid()
```

- `user_id`는 서버에서 `auth.uid()`로 강제(클라이언트 신뢰 금지). default 또는 트리거로 세팅.
- 상태가 READING/DONE이면 시작일/완독일 자동(#02 트리거 공유).

## 4. 태그 생성/연결

```
# 기존 태그 조회
GET /rest/v1/tags?select=id,name
# 신규 태그 생성(중복 방지: unique(user_id,name))
POST /rest/v1/tags { name }                      # 또는 upsert on conflict
# 책-태그 연결
POST /rest/v1/book_tags { book_id, tag_id }
```

- `tags`에 `unique(user_id, name)` 존재(스키마). upsert로 중복 생성 방지 권장.
- **RPC 권장**: `create_book_with_tags(payload, tag_names text[])`로 책+태그+연결을 한 트랜잭션에 — 프론트 왕복/부분 실패를 줄임.

```sql
create or replace function public.create_book_with_tags(book jsonb, tag_names text[])
returns public.books language plpgsql security invoker as $$
declare new_book public.books; t text; tid uuid;
begin
  insert into public.books (user_id, title, author, publisher, page_count, isbn, cover_image_url, reading_status)
  select auth.uid(), book->>'title', book->>'author', book->>'publisher',
         (book->>'page_count')::int, book->>'isbn', book->>'cover_image_url',
         coalesce((book->>'reading_status')::reading_status, 'WANT')
  returning * into new_book;
  foreach t in array coalesce(tag_names,'{}') loop
    insert into public.tags(user_id,name) values (auth.uid(), t)
      on conflict (user_id,name) do update set name=excluded.name
      returning id into tid;
    insert into public.book_tags(book_id,tag_id,user_id) values (new_book.id, tid, auth.uid())
      on conflict do nothing;
  end loop;
  return new_book;
end $$;
```

## 5. 수용 기준

- [ ] 알라딘 우선, 실패 시 카카오 폴백. 둘 다 실패 → 404.
- [ ] 어떤 키도 클라이언트 응답/번들에 포함되지 않음.
- [ ] 책 생성 시 `user_id`가 서버에서 강제됨.
- [ ] 동일 이름 태그 재사용(중복 생성 없음).

## 6. 프론트 연동 지점

- `lookupByIsbn()` → 2. (이미 구현; URL 미설정 시 null → 수동 입력)
- `addBook()` / `ensureTags()`(로컬) → 추후 3·4(또는 RPC)로 교체.

## 7. 열린 질문

1. 책+태그 생성을 RPC 단일 트랜잭션으로 갈지, 개별 호출로 둘지?
2. 표지 외부 URL vs Storage 복제?
3. 카카오/알라딘 동시 호출 후 병합 vs 순차 폴백(현재 순차)?
