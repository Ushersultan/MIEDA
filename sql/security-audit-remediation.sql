begin;
-- Owner profiles cannot be deleted/recreated to acquire a privileged role.
drop policy if exists "Profil visible par le propriétaire" on public.profiles;
create policy profile_owner_read on public.profiles for select to authenticated using (auth.uid()=id);
create policy profile_owner_update on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);
create policy profile_owner_insert on public.profiles for insert to authenticated with check (auth.uid()=id and role='membre');
revoke truncate, references, trigger on public.profiles from anon, authenticated;
create or replace function public.bloquer_changement_role()
returns trigger language plpgsql set search_path='' as $$
begin
 if current_user in ('postgres','service_role','supabase_admin') then return new; end if;
 if TG_OP='INSERT' then
   if new.role is distinct from 'membre' then raise exception 'Initial role must be membre' using errcode='42501'; end if;
 elsif new.role is distinct from old.role or
       (old.role in ('pasteur','prophete','admin') and new.eglise_id is distinct from old.eglise_id) then
   if public.my_role() is distinct from 'admin' or (auth.jwt()->>'aal') is distinct from 'aal2' then
     raise exception 'Administrator MFA required' using errcode='42501';
   end if;
 end if;
 return new;
end; $$;
drop trigger if exists trg_bloquer_role on public.profiles;
create trigger trg_bloquer_role before insert or update on public.profiles for each row execute function public.bloquer_changement_role();

create or replace function public.admin_generer_code(p_eglise_id text,p_description text)
returns text language plpgsql security definer set search_path='' as $$
declare v_code text;
begin
 if auth.uid() is null or public.my_role() is distinct from 'admin' or (auth.jwt()->>'aal') is distinct from 'aal2' then return 'refuse'; end if;
 v_code := 'MIEDA-' || upper(replace(gen_random_uuid()::text,'-',''));
 insert into public.codes_pasteur(code,eglise_id,description) values(v_code,p_eglise_id,p_description);
 return v_code;
end; $$;
create or replace function public.admin_promouvoir_pasteur(p_user_id uuid,p_eglise_id text)
returns text language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or public.my_role() is distinct from 'admin' or (auth.jwt()->>'aal') is distinct from 'aal2' then return 'refuse'; end if;
 if p_user_id=auth.uid() then return 'refuse'; end if;
 update public.profiles set role='pasteur',eglise_id=p_eglise_id where id=p_user_id;
 return 'ok';
end; $$;
create or replace function public.admin_retrograder(p_user_id uuid)
returns text language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or public.my_role() is distinct from 'admin' or (auth.jwt()->>'aal') is distinct from 'aal2' then return 'refuse'; end if;
 if p_user_id=auth.uid() then return 'refuse'; end if;
 update public.profiles set role='membre' where id=p_user_id;
 return 'ok';
end; $$;
create or replace function public.changer_role(cible_id uuid,nouveau_role text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or public.my_role() is distinct from 'admin' or (auth.jwt()->>'aal') is distinct from 'aal2' then raise exception 'Administrator MFA required' using errcode='42501'; end if;
 if nouveau_role is null or nouveau_role not in ('membre','pasteur','prophete','admin') then raise exception 'Invalid role'; end if;
 if cible_id=auth.uid() and nouveau_role<>'admin' then raise exception 'Self-demotion denied'; end if;
 update public.profiles set role=nouveau_role where id=cible_id;
 if not found then raise exception 'Profile not found'; end if;
end; $$;

-- Private per-user attempt counter, inaccessible to browser roles.
create table public.pastor_code_attempts(user_id uuid primary key references auth.users(id) on delete cascade, attempts integer not null, window_start timestamptz not null);
alter table public.pastor_code_attempts enable row level security;
revoke all on public.pastor_code_attempts from public,anon,authenticated;
create or replace function public.activer_code_pasteur(p_code text)
returns text language plpgsql security definer set search_path='' as $$
declare v_eglise text; v_code text; v_attempts integer; v_role text;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then return 'non_connecte'; end if;
 select role into v_role from public.profiles where id=auth.uid() for update;
 if v_role is distinct from 'membre' then return 'refuse'; end if;
 insert into public.pastor_code_attempts values(auth.uid(),1,now())
 on conflict(user_id) do update set
 attempts=case when pastor_code_attempts.window_start < now()-interval '15 minutes' then 1 else least(pastor_code_attempts.attempts+1,6) end,
 window_start=case when pastor_code_attempts.window_start < now()-interval '15 minutes' then now() else pastor_code_attempts.window_start end
 returning attempts into v_attempts;
 if v_attempts>5 then return 'trop_de_tentatives'; end if;
 v_code:=upper(trim(p_code));
 if v_code is null or length(v_code)>160 then return 'code_invalide'; end if;
 select eglise_id into v_eglise from public.codes_pasteur where code=v_code and actif and used_by is null for update;
 if not found then return 'code_invalide'; end if;
 update public.codes_pasteur set used_by=auth.uid(),used_at=now(),actif=false where code=v_code;
 update public.profiles set role='pasteur',eglise_id=v_eglise where id=auth.uid();
 return 'ok';
end; $$;
-- No code redemption during signup: activation after confirmed login uses the limiter.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_meta jsonb:=coalesce(new.raw_user_meta_data,'{}'::jsonb);
begin
 insert into public.profiles(id,full_name,ville,pays,eglise_id,role)
 values(new.id,left(coalesce(v_meta->>'full_name',''),120),coalesce(v_meta->>'ville',''),coalesce(v_meta->>'pays',''),nullif(v_meta->>'eglise_id',''),'membre')
 on conflict(id) do nothing;
 return new;
end; $$;
update public.codes_pasteur set code='MIEDA-'||upper(replace(gen_random_uuid()::text,'-','')) where actif and used_by is null and code ~ '-[0-9A-F]{4}$';
revoke all on function public.activer_code_pasteur(text),public.admin_generer_code(text,text),public.admin_promouvoir_pasteur(uuid,text),public.admin_retrograder(uuid),public.changer_role(uuid,text) from public,anon;
grant execute on function public.activer_code_pasteur(text),public.admin_generer_code(text,text),public.admin_promouvoir_pasteur(uuid,text),public.admin_retrograder(uuid),public.changer_role(uuid,text) to authenticated;
revoke all on function public.handle_new_user(),public.bloquer_changement_role() from public,anon,authenticated;
alter function public.tokens_nom(text) set search_path='';
-- Apply MFA to privileged direct table writes, not just page navigation.
create policy codes_admin_mfa_insert on public.codes_pasteur as restrictive for insert to authenticated with check ((auth.jwt()->>'aal')='aal2');
create policy codes_admin_mfa_update on public.codes_pasteur as restrictive for update to authenticated using ((auth.jwt()->>'aal')='aal2') with check ((auth.jwt()->>'aal')='aal2');
create policy message_mfa_insert on public.messages_prophetiques as restrictive for insert to authenticated with check ((auth.jwt()->>'aal')='aal2');
create policy message_mfa_update on public.messages_prophetiques as restrictive for update to authenticated using ((auth.jwt()->>'aal')='aal2') with check ((auth.jwt()->>'aal')='aal2');
create policy message_mfa_delete on public.messages_prophetiques as restrictive for delete to authenticated using ((auth.jwt()->>'aal')='aal2');
create policy annonces_mfa_insert on public.annonces as restrictive for insert to authenticated with check ((auth.jwt()->>'aal')='aal2');
create policy annonces_mfa_update on public.annonces as restrictive for update to authenticated using ((auth.jwt()->>'aal')='aal2') with check ((auth.jwt()->>'aal')='aal2');
create policy annonces_mfa_delete on public.annonces as restrictive for delete to authenticated using ((auth.jwt()->>'aal')='aal2');
create policy prayer_mfa_update on public.prieres as restrictive for update to authenticated using ((auth.jwt()->>'aal')='aal2') with check ((auth.jwt()->>'aal')='aal2');
create policy department_mfa_update on public.demandes_departement as restrictive for update to authenticated using ((auth.jwt()->>'aal')='aal2') with check ((auth.jwt()->>'aal')='aal2');
commit;
