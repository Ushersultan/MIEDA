-- Production project: verify its URL matches the deployed app before running.
-- Requires Supabase TOTP enabled and the MFA gate from security PR #3.
begin;
create table if not exists public.church_media (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 3000),
  url text not null check (length(url) <= 2048),
  kind text not null check (kind in ('youtube','mp4')),
  is_live boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check (not is_live or kind = 'youtube'),
  check ((kind = 'youtube' and url ~ '^https://((www\.|m\.)?youtube\.com/(watch\?v=[A-Za-z0-9_-]{11}([&].*)?|(live|shorts|embed)/[A-Za-z0-9_-]{11}([?].*)?)|youtu\.be/[A-Za-z0-9_-]{11}([?].*)?)$')
    or (kind = 'mp4' and url ~* '^https://[^/[:space:]]+/[^[:space:]]+\.mp4([?][^[:space:]]*)?$'))
);
create unique index if not exists church_media_one_live on public.church_media (is_live) where is_live and published;
alter table public.church_media enable row level security;
revoke all on public.church_media from anon, authenticated;
grant select on public.church_media to anon;
grant select, insert, update on public.church_media to authenticated;
create or replace function public.can_manage_church_media()
returns boolean language sql stable security definer set search_path = '' as $$
  select (auth.jwt()->>'aal') = 'aal2' and exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.can_manage_church_media() from public;
grant execute on function public.can_manage_church_media() to authenticated;
drop policy if exists church_media_public_read on public.church_media;
create policy church_media_public_read on public.church_media for select to anon, authenticated using (published);
drop policy if exists church_media_admin_read on public.church_media;
create policy church_media_admin_read on public.church_media for select to authenticated using (public.can_manage_church_media());
drop policy if exists church_media_admin_insert on public.church_media;
create policy church_media_admin_insert on public.church_media for insert to authenticated with check (public.can_manage_church_media());
drop policy if exists church_media_admin_update on public.church_media;
create policy church_media_admin_update on public.church_media for update to authenticated using (public.can_manage_church_media()) with check (public.can_manage_church_media());
commit;
