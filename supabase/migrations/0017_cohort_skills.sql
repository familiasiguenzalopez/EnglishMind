-- ════════════════════════════════════════════════════════════
-- 0017 · Reporte de DESTREZAS de la cohorte (MEDIR SIN VIGILAR).
-- Agrega skill_events de los alumnos de una cohorte y devuelve, POR CATEGORIA,
-- cuántos alumnos la tienen como reto actual y cuántos la van superando.
-- NUNCA devuelve user_id ni 'note' (el contenido) — solo competencia agregada.
-- SECURITY DEFINER + chequeo is_org_staff (igual que cohort_report).
-- ════════════════════════════════════════════════════════════

create or replace function public.cohort_skills(p_cohort uuid)
returns table(category text, working_students int, improving_students int, mentions int)
language plpgsql security definer set search_path = public stable as $$
declare v_org uuid;
begin
  select org_id into v_org from cohorts where id = p_cohort;
  if v_org is null or not public.is_org_staff(v_org) then
    raise exception 'No autorizado';
  end if;
  return query
  with learners as (
    select m.user_id
    from memberships m
    where m.cohort_id = p_cohort and m.role = 'learner'
  ),
  sessions as (
    select e.user_id, e.created_at
    from skill_events e
    join learners l on l.user_id = e.user_id
    where e.category = '__session__'
  ),
  last_focus as (
    select e.user_id, e.category, max(e.created_at) as last_seen, count(*)::int as cnt
    from skill_events e
    join learners l on l.user_id = e.user_id
    where e.category <> '__session__'
    group by e.user_id, e.category
  ),
  streaks as (
    select lf.user_id, lf.category, lf.cnt,
      (select count(*) from sessions s
       where s.user_id = lf.user_id and s.created_at > lf.last_seen)::int as streak
    from last_focus lf
  )
  select
    st.category,
    (count(distinct st.user_id) filter (where st.streak <= 1))::int as working_students,
    (count(distinct st.user_id) filter (where st.cnt >= 2 and st.streak >= 2))::int as improving_students,
    sum(st.cnt)::int as mentions
  from streaks st
  group by st.category
  having count(distinct st.user_id) filter (where st.streak <= 1) > 0
      or count(distinct st.user_id) filter (where st.cnt >= 2 and st.streak >= 2) > 0
  order by sum(st.cnt) desc;
end; $$;

grant execute on function public.cohort_skills(uuid) to authenticated;
