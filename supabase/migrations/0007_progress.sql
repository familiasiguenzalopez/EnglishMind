-- ════════════════════════════════════════════════════════════
-- Persistencia de progreso/gamificación por usuario.
-- profiles += xp, streak_days, last_active, achievements.
-- RPC record_activity(): atómica, opera SOLO sobre auth.uid().
--   - actualiza la racha (celebra continuidad, reinicia tras un hueco)
--   - suma XP, agrega logro si es nuevo
--   - devuelve totales + el logro recién desbloqueado (para el toast)
-- ════════════════════════════════════════════════════════════

alter table profiles add column if not exists xp int not null default 0;
alter table profiles add column if not exists streak_days int not null default 0;
alter table profiles add column if not exists last_active date;
alter table profiles add column if not exists achievements text[] not null default '{}';

create or replace function public.record_activity(
  p_xp int,
  p_achievement text,
  p_achievement_label text
)
returns table (xp int, streak_days int, new_achievement text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_last date;
  v_streak int;
  v_xp int;
  v_ach text[];
  v_new text := null;
begin
  if v_uid is null then
    raise exception 'no autenticado';
  end if;

  insert into profiles (id) values (v_uid) on conflict (id) do nothing;

  select p.last_active, p.streak_days, p.xp, p.achievements
    into v_last, v_streak, v_xp, v_ach
    from profiles p where p.id = v_uid for update;

  if v_last is null then
    v_streak := 1;
  elsif v_last = current_date then
    v_streak := coalesce(v_streak, 1);
  elsif v_last = current_date - 1 then
    v_streak := coalesce(v_streak, 0) + 1;
  else
    v_streak := 1;
  end if;

  v_xp := coalesce(v_xp, 0) + coalesce(p_xp, 0);

  if p_achievement is not null
     and not (p_achievement = any(coalesce(v_ach, '{}'::text[]))) then
    v_ach := array_append(coalesce(v_ach, '{}'::text[]), p_achievement);
    v_new := p_achievement_label;
  end if;

  update profiles
    set xp = v_xp,
        streak_days = v_streak,
        last_active = current_date,
        achievements = coalesce(v_ach, achievements)
    where id = v_uid;

  return query select v_xp, v_streak, v_new;
end;
$$;

grant execute on function public.record_activity(int, text, text) to authenticated;
