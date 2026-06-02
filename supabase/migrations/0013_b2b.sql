-- ════════════════════════════════════════════════════════════
-- Capa B2B: crear organización/cohorte, unirse por código, y un reporte
-- agregado "MEDIR SIN VIGILAR" (el staff ve nivel/XP/lecciones, NUNCA
-- conversaciones ni grabaciones — esas tablas no se tocan aquí).
-- ════════════════════════════════════════════════════════════

alter table cohorts add column if not exists join_code text unique;

-- Crear organización (el creador queda como admin)
create or replace function public.create_org(p_name text, p_type text)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); v_org uuid;
begin
  if uid is null then raise exception 'Debes iniciar sesion'; end if;
  insert into orgs (name, type) values (nullif(trim(p_name), ''), coalesce(p_type, 'colegio'))
    returning id into v_org;
  insert into memberships (org_id, user_id, role) values (v_org, uid, 'admin')
    on conflict (org_id, user_id) do update set role = 'admin';
  return v_org;
end; $$;
grant execute on function public.create_org(text, text) to authenticated;

-- Crear cohorte (solo staff de la org); genera código de unión
create or replace function public.create_cohort(p_org uuid, p_name text, p_route text)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_code text; v_route uuid;
begin
  if not public.is_org_staff(p_org) then raise exception 'No autorizado'; end if;
  v_code := upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6));
  select id into v_route from routes where slug = p_route;
  insert into cohorts (org_id, name, route_id, join_code)
    values (p_org, nullif(trim(p_name), ''), v_route, v_code) returning id into v_id;
  return json_build_object('id', v_id, 'join_code', v_code);
end; $$;
grant execute on function public.create_cohort(uuid, text, text) to authenticated;

-- Unirse a una cohorte con el código (el usuario queda como learner)
create or replace function public.join_cohort(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); v_c uuid; v_o uuid; v_oname text; v_cname text;
begin
  if uid is null then raise exception 'Debes iniciar sesion'; end if;
  select c.id, c.org_id, c.name, o.name into v_c, v_o, v_cname, v_oname
    from cohorts c join orgs o on o.id = c.org_id
    where upper(c.join_code) = upper(trim(p_code));
  if v_c is null then raise exception 'Codigo invalido'; end if;
  insert into memberships (org_id, user_id, cohort_id, role)
    values (v_o, uid, v_c, 'learner')
    on conflict (org_id, user_id) do update set cohort_id = v_c;
  return json_build_object('org', v_oname, 'cohort', v_cname);
end; $$;
grant execute on function public.join_cohort(text) to authenticated;

-- Mis membresías (con nombres) — para la pantalla B2B
create or replace function public.my_memberships()
returns table(org_id uuid, org_name text, cohort_id uuid, cohort_name text, role text)
language sql security definer set search_path = public stable as $$
  select m.org_id, o.name, m.cohort_id, c.name, m.role::text
  from memberships m
  join orgs o on o.id = m.org_id
  left join cohorts c on c.id = m.cohort_id
  where m.user_id = auth.uid();
$$;
grant execute on function public.my_memberships() to authenticated;

-- Reporte agregado de una cohorte (MEDIR SIN VIGILAR): solo competencia.
create or replace function public.cohort_report(p_cohort uuid)
returns table(name text, cefr text, xp int, streak int, lessons int)
language plpgsql security definer set search_path = public stable as $$
declare v_org uuid;
begin
  select org_id into v_org from cohorts where id = p_cohort;
  if v_org is null or not public.is_org_staff(v_org) then raise exception 'No autorizado'; end if;
  return query
    select
      coalesce(p.display_name, split_part(u.email, '@', 1), 'Alumno') as name,
      coalesce(p.cefr_level, '—') as cefr,
      coalesce(p.xp, 0)::int as xp,
      coalesce(p.streak_days, 0)::int as streak,
      (select count(*)::int from progress pr where pr.user_id = m.user_id and pr.status = 'done') as lessons
    from memberships m
    join profiles p on p.id = m.user_id
    join auth.users u on u.id = m.user_id
    where m.cohort_id = p_cohort and m.role = 'learner';
end; $$;
grant execute on function public.cohort_report(uuid) to authenticated;
