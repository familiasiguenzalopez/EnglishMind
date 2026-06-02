-- ════════════════════════════════════════════════════════════
-- Acceso de administrador + RLS para el orquestador.
-- El panel admin (cliente) lee/edita orchestrator_config solo si is_admin.
-- (Las API keys NO viven en esta tabla; siguen en secrets del servidor.)
-- ════════════════════════════════════════════════════════════

alter table profiles add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

drop policy if exists "orq admin select" on orchestrator_config;
drop policy if exists "orq admin update" on orchestrator_config;

create policy "orq admin select" on orchestrator_config
  for select to authenticated using (public.is_admin());
create policy "orq admin update" on orchestrator_config
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Dev: marca como admin los perfiles existentes (proyecto de un solo usuario).
update profiles set is_admin = true;
