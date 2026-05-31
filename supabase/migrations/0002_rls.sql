-- ════════════════════════════════════════════════════════════
-- EnglishMind AI · RLS y políticas (Fase 0)
-- Invariantes:
--  · Datos del alumno = owner-only (auth.uid() = user_id).
--  · "Medir sin vigilar": no hay política que dé a managers acceso a
--    pronunciation_events / writing_events / capsules. Los agregados de
--    cohorte se expondrán vía funciones SECURITY DEFINER (Fase 4).
--  · orchestrator_config: RLS activo SIN políticas => solo service_role
--    (admin server-side). Las API keys nunca se guardan en tablas.
--  · Verificación de certificado: función pública por ID opaco.
-- ════════════════════════════════════════════════════════════

-- Activar RLS en todo
alter table profiles enable row level security;
alter table tutors enable row level security;
alter table routes enable row level security;
alter table units enable row level security;
alter table lessons enable row level security;
alter table progress enable row level security;
alter table skill_scores enable row level security;
alter table pronunciation_events enable row level security;
alter table writing_events enable row level security;
alter table capsules enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table orchestrator_config enable row level security;
alter table ai_usage enable row level security;
alter table certificates enable row level security;
alter table orgs enable row level security;
alter table cohorts enable row level security;
alter table memberships enable row level security;
alter table marketplace_products enable row level security;
alter table orders enable row level security;

-- ── Perfil: owner-only ─────────────────────────────────────
create policy "perfil propio: leer" on profiles
  for select to authenticated using (auth.uid() = id);
create policy "perfil propio: editar" on profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "perfil propio: crear" on profiles
  for insert to authenticated with check (auth.uid() = id);

-- ── Catálogo de aprendizaje: lectura para autenticados ─────
create policy "catalogo tutores" on tutors
  for select to authenticated using (true);
create policy "catalogo rutas" on routes
  for select to authenticated using (true);
create policy "catalogo unidades" on units
  for select to authenticated using (true);
create policy "catalogo lecciones" on lessons
  for select to authenticated using (true);

-- ── Planes activos y productos activos: catálogo público ───
create policy "planes activos visibles" on plans
  for select to authenticated using (state = 'activo');
create policy "productos activos visibles" on marketplace_products
  for select to authenticated using (is_active = true);

-- ── Datos del alumno: owner-only (helper macro manual) ─────
create policy "progreso propio" on progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "skills propios" on skill_scores
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pronunciacion propia" on pronunciation_events
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "escritura propia" on writing_events
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "capsulas propias" on capsules
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "suscripcion propia: leer" on subscriptions
  for select to authenticated using (auth.uid() = user_id);
create policy "uso ia propio: leer" on ai_usage
  for select to authenticated using (auth.uid() = user_id);
create policy "ordenes propias" on orders
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "certificados propios: leer" on certificates
  for select to authenticated using (auth.uid() = user_id);

-- ── B2B: helper para staff de la organización ──────────────
create or replace function public.is_org_staff(p_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from memberships m
    where m.org_id = p_org
      and m.user_id = auth.uid()
      and m.role in ('admin', 'manager', 'instructor')
  );
$$;

create policy "membresia propia" on memberships
  for select to authenticated using (user_id = auth.uid());
create policy "membresias de mi org (staff)" on memberships
  for select to authenticated using (public.is_org_staff(org_id));
create policy "org visible para su staff" on orgs
  for select to authenticated using (public.is_org_staff(id));
create policy "cohorte visible para su staff" on cohorts
  for select to authenticated using (public.is_org_staff(org_id));

-- ── Verificación pública de certificado (ID opaco) ─────────
-- Devuelve solo campos seguros; nada sensible. Callable por anon.
create or replace function public.verify_certificate(p_public_id text)
returns table (
  holder_name text,
  global_cefr text,
  skills jsonb,
  issued_at timestamptz,
  expires_at timestamptz,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.holder_name,
    c.global_cefr,
    c.skills,
    c.issued_at,
    c.expires_at,
    case
      when c.revoked then 'revocado'
      when c.expires_at is not null and c.expires_at < now() then 'expirado'
      else 'válido'
    end as status
  from certificates c
  where c.public_id = p_public_id;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
