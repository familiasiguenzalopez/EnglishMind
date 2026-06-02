-- ════════════════════════════════════════════════════════════
-- Emisión de certificado (EnglishMind Proficiency Statement).
-- RPC SECURITY DEFINER: crea la credencial para el usuario logueado
-- (toma nivel global del perfil y habilidades de skill_scores) y
-- devuelve el public_id (para /verify/{id}). NO es examen oficial.
-- ════════════════════════════════════════════════════════════

create or replace function public.issue_certificate(p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_global text;
  v_skills jsonb;
  v_pub text;
begin
  if uid is null then
    raise exception 'Debes iniciar sesion para emitir un certificado';
  end if;

  select coalesce(cefr_level, 'A1') into v_global from profiles where id = uid;
  if v_global is null then v_global := 'A1'; end if;

  select coalesce(jsonb_object_agg(skill::text, cefr), '{}'::jsonb)
    into v_skills
    from skill_scores
    where user_id = uid and cefr is not null;

  insert into certificates (user_id, holder_name, global_cefr, skills, expires_at)
  values (
    uid,
    nullif(trim(coalesce(p_name, '')), ''),
    v_global,
    coalesce(v_skills, '{}'::jsonb),
    now() + interval '2 years'
  )
  returning public_id into v_pub;

  return v_pub;
end;
$$;

grant execute on function public.issue_certificate(text) to authenticated;
