-- Apply in the MIEDA production project's SQL Editor after reviewing existing
-- triggers/RLS/RPC definitions. This does not replace existing RLS policies.
-- Verify the project URL matches the deployed application's URL first.
begin;
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare actor_role text;
begin
  -- Trusted SQL migrations/service operations have no authenticated end-user role.
  if auth.role() is distinct from 'authenticated' then return new; end if;
  if TG_OP = 'INSERT' then
    if coalesce(new.role, 'membre') <> 'membre' then
      raise exception 'Initial role must be membre' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.role is not distinct from old.role then return new; end if;
  select role into actor_role from public.profiles where id = auth.uid();
  if actor_role is distinct from 'admin' or (auth.jwt()->>'aal') is distinct from 'aal2' then
    raise exception 'Role changes require an administrator with MFA' using errcode = '42501';
  end if;
  if new.role is null or new.role not in ('membre','pasteur','prophete','admin') then
    raise exception 'Invalid role' using errcode = '22023';
  end if;
  if old.id = auth.uid() and new.role <> 'admin' then
    raise exception 'Self-demotion is not permitted' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_profile_role_change() from public, anon, authenticated;
drop trigger if exists mieda_guard_profile_role on public.profiles;
create trigger mieda_guard_profile_role before insert or update of role
on public.profiles for each row execute function public.guard_profile_role_change();
commit;
