# 백엔드 작업 요청서 #05 — 기록(ReadingRecord) + 이미지

> Supabase 기준. `records` 테이블(책 1:N) + Storage(이미지).

## 1. 범위

- 기록 생성 / 수정 / 삭제 (제목 + 본문)
- 본문 내 이미지 첨부 → Supabase Storage 업로드
- (자동 저장) 작성 중 주기적 저장

## 2. 기록 CRUD

```
POST   /rest/v1/records   { "book_id", "title", "body" }   → 201
PATCH  /rest/v1/records?id=eq.{id}  { "title?", "body?" }
DELETE /rest/v1/records?id=eq.{id}
```

- `user_id`는 서버 `auth.uid()` 강제. `book_id`는 본인 책(RLS+FK).
- `updated_at`은 트리거로 `now()` 갱신.

응답 계약:
```jsonc
{ "id", "book_id", "title", "body", "created_at", "updated_at" }
```

## 3. 이미지 업로드 (Storage)

- 버킷: `record-images` (private). 경로: `{user_id}/{record_id}/{uuid}.jpg`.
- 클라이언트가 `expo-image-picker`로 고른 이미지를 업로드 → 반환된 경로/URL을 본문에 임베드.

```
POST  {SUPABASE_URL}/storage/v1/object/record-images/{path}   (binary)
GET   signed URL  /storage/v1/object/sign/record-images/{path}
```

- RLS(스토리지 정책): `bucket_id='record-images' AND (storage.foldername(name))[1] = auth.uid()::text`.
- 본문 임베드 형식(제안): 마크다운 `![](signed-or-path)` 또는 `body`를 블록 JSON으로 확장. **결정 필요**(아래 6).

## 4. 자동 저장

- 클라이언트가 디바운스(예: 1.5s) 후 PATCH. 신규 기록은 첫 입력 시 POST로 생성 후 이후 PATCH.
- 서버는 멱등 PATCH만 보장하면 됨. 충돌은 `updated_at` last-write-wins.

## 5. 수용 기준

- [ ] 본인 책의 기록만 CRUD (RLS).
- [ ] 이미지가 다른 사용자 폴더에 쓰이지 않음(스토리지 정책).
- [ ] 삭제 시 연결 이미지도 정리(트리거 또는 클라이언트 정리 — 정책 결정).
- [ ] 책 상세의 "기록 N" 카운트 일관.

## 6. 본문/이미지 모델 — 결정 필요

현재 프론트 `ReadingRecord.body`는 **plain text**. 이미지 임베드를 위해:
- (a) 마크다운 문자열(이미지 URL 포함) — 단순, 렌더러 필요.
- (b) 블록 배열 JSON(`[{type:'text'|'image', ...}]`) — 구조적, 스키마 변경.

→ 택1 결정 시 프론트 에디터/렌더러와 `records.body` 타입을 맞춘다.
(현재 MVP: 본문 plain text, 이미지는 화면 로컬 미리보기만. 업로드/임베드는 본 요청 반영 후 연결.)

## 7. 프론트 연동 지점

- `addRecord / updateRecord / deleteRecord`(로컬) → 2로 교체.
- `pickImage()`(expo-image-picker) → 3의 업로드 + 본문 임베드로 확장.
