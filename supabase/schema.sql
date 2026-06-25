-- 번잡한 책방 — Supabase schema (skeleton)
-- Postgres + Row-Level Security. Single-account data isolation: every row is
-- owned by auth.uid(). Apply with the Supabase SQL editor or `supabase db push`.
--
-- Relationships:
--   books 1—N quotes
--   books 1—N records
--   books N—M tags  (via book_tags)

-- ── enums ───────────────────────────────────────────────────────
do $$ begin
  create type reading_status as enum ('WANT', 'READING', 'DONE');
exception
  when duplicate_object then null;
end $$;

-- ── tables ──────────────────────────────────────────────────────
create table if not exists public.books (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  isbn            text,
  title           text not null,
  author          text not null,
  publisher       text,
  cover_image_url text,
  page_count      int,
  reading_status  reading_status not null default 'WANT',
  rating          int check (rating between 0 and 5),
  purchased_date  date,
  started_date    date,
  finished_date   date,
  memo            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.tags (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name    text not null,
  unique (user_id, name)
);

create table if not exists public.book_tags (
  book_id uuid not null references public.books (id) on delete cascade,
  tag_id  uuid not null references public.tags (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (book_id, tag_id)
);

create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  book_id     uuid not null references public.books (id) on delete cascade,
  text        text not null,
  page_number int,
  created_at  timestamptz not null default now()
);

create table if not exists public.records (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  book_id    uuid not null references public.books (id) on delete cascade,
  title      text not null,
  body       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── indexes ─────────────────────────────────────────────────────
create index if not exists books_user_idx        on public.books (user_id);
create index if not exists books_status_idx       on public.books (user_id, reading_status);
create index if not exists books_finished_idx     on public.books (user_id, finished_date);
create index if not exists quotes_book_idx         on public.quotes (book_id);
create index if not exists records_book_idx        on public.records (book_id);
create index if not exists book_tags_tag_idx       on public.book_tags (tag_id);

-- ── row-level security ──────────────────────────────────────────
alter table public.books     enable row level security;
alter table public.tags      enable row level security;
alter table public.book_tags enable row level security;
alter table public.quotes    enable row level security;
alter table public.records   enable row level security;

-- One policy per table: a user may only touch their own rows.
do $$
declare t text;
begin
  foreach t in array array['books','tags','book_tags','quotes','records'] loop
    execute format($f$
      drop policy if exists %1$s_owner on public.%1$s;
      create policy %1$s_owner on public.%1$s
        for all
        using (user_id = auth.uid())
        with check (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;
