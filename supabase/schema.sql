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

-- ════════════════════════════════════════════════════════════════
-- Triggers — auto dates (#02)
-- ════════════════════════════════════════════════════════════════
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

drop trigger if exists trg_touch_reading_dates on public.books;
create trigger trg_touch_reading_dates before update on public.books
for each row execute function public.touch_reading_dates();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists trg_records_updated_at on public.records;
create trigger trg_records_updated_at before update on public.records
for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
-- RPC — status counts (#01) + create book with tags (#03)
-- ════════════════════════════════════════════════════════════════
create or replace function public.book_status_counts()
returns table(status text, count bigint)
language sql stable security invoker as $$
  select reading_status::text, count(*)
  from public.books
  where user_id = auth.uid()
  group by reading_status;
$$;

create or replace function public.create_book_with_tags(book jsonb, tag_names text[])
returns public.books language plpgsql security invoker as $$
declare new_book public.books; t text; tid uuid;
begin
  insert into public.books (user_id, title, author, publisher, page_count, isbn, cover_image_url, reading_status)
  select auth.uid(), book->>'title', book->>'author', book->>'publisher',
         nullif(book->>'page_count','')::int, book->>'isbn', book->>'cover_image_url',
         coalesce((book->>'reading_status')::reading_status, 'WANT')
  returning * into new_book;

  foreach t in array coalesce(tag_names, '{}') loop
    insert into public.tags(user_id, name) values (auth.uid(), t)
      on conflict (user_id, name) do update set name = excluded.name
      returning id into tid;
    insert into public.book_tags(book_id, tag_id, user_id) values (new_book.id, tid, auth.uid())
      on conflict do nothing;
  end loop;
  return new_book;
end $$;

-- ════════════════════════════════════════════════════════════════
-- Profiles — preferences sync (#06)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  yearly_goal   int  not null default 30,
  default_sort  text not null default 'recent',
  theme         text not null default 'system',
  last_backup_at timestamptz,
  updated_at    timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_owner on public.profiles;
create policy profiles_owner on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- create a profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════
-- Storage — cover + record image buckets (#03, #05)
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true), ('record-images', 'record-images', false)
on conflict (id) do nothing;

-- record-images: private, owner-scoped by first path segment = user id
drop policy if exists record_images_owner on storage.objects;
create policy record_images_owner on storage.objects
  for all to authenticated
  using (bucket_id = 'record-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'record-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- covers: public read, authenticated write into own folder
drop policy if exists covers_read on storage.objects;
create policy covers_read on storage.objects
  for select using (bucket_id = 'covers');
drop policy if exists covers_write on storage.objects;
create policy covers_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
