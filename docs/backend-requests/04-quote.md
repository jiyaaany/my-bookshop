# 백엔드 작업 요청서 #04 — 구절(Quote)

> Supabase 기준. 공통 인증/RLS는 #01 참고. 구절은 `quotes` 테이블(책 1:N).

## 1. 범위

- 구절 생성 / 수정 / 삭제 (특정 책에 연결)
- (향후) 사진 OCR로 구절 추출 — 현재 UI에 "곧" 배지, 아래 6 참고

## 2. 엔드포인트

```
# 생성
POST /rest/v1/quotes
Body: { "book_id", "text", "page_number?" }
→ 201 { id, ... }

# 수정
PATCH /rest/v1/quotes?id=eq.{id}
Body: { "text?", "page_number?" }

# 삭제
DELETE /rest/v1/quotes?id=eq.{id}
```

- `user_id`는 서버에서 `auth.uid()` 강제(default/트리거). 클라이언트 값 신뢰 금지.
- `book_id`는 본인 소유 책이어야 함(RLS + FK).

## 3. 응답 계약

```jsonc
{ "id", "book_id", "text", "page_number": "int|null", "created_at" }
```

## 4. 검증

- `text`는 trim 후 비어 있으면 400(또는 클라이언트 차단 — 현재 저장 버튼 비활성).
- `page_number`는 양의 정수 또는 null.

## 5. 수용 기준

- [ ] 본인 책의 구절만 생성/수정/삭제 (RLS).
- [ ] 책 상세의 "인상깊은 구절 N" 카운트가 생성/삭제와 일관.
- [ ] 삭제는 해당 구절만 (책/기록 영향 없음).

## 6. 향후 — OCR (별도)

- 사진 → 텍스트 추출은 별도 함수/서비스(예: Vision API)로. 키는 엣지 함수 뒤.
- 계약(안): `POST /functions/v1/ocr-quote { imageBase64 }` → `{ text }`. 본 요청서 범위 밖, 자리만 표시.

## 7. 프론트 연동 지점

- `addQuote / updateQuote / deleteQuote`(로컬) → 2의 호출로 교체.
- 저장 후 책 상세로 복귀, 구절 목록 갱신.
