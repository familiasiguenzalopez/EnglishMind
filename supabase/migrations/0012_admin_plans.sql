-- ════════════════════════════════════════════════════════════
-- Admin: gestionar planes (crear/editar) desde el panel.
-- Los no-admin solo ven planes 'activo' (policy previa); los admin ven
-- todos y pueden insertar/actualizar.
-- ════════════════════════════════════════════════════════════
drop policy if exists "planes admin select" on plans;
drop policy if exists "planes admin insert" on plans;
drop policy if exists "planes admin update" on plans;

create policy "planes admin select" on plans
  for select to authenticated using (public.is_admin());
create policy "planes admin insert" on plans
  for insert to authenticated with check (public.is_admin());
create policy "planes admin update" on plans
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
