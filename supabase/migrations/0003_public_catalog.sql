-- ════════════════════════════════════════════════════════════
-- Catálogo legible sin login (onboarding y selección de tutor son
-- pre-registro). Pasa las políticas de SELECT de 'authenticated' a
-- 'anon, authenticated'. Sigue siendo solo lectura y solo catálogo;
-- los datos del alumno permanecen owner-only.
-- ════════════════════════════════════════════════════════════

drop policy if exists "catalogo tutores" on tutors;
drop policy if exists "catalogo rutas" on routes;
drop policy if exists "catalogo unidades" on units;
drop policy if exists "catalogo lecciones" on lessons;
drop policy if exists "planes activos visibles" on plans;
drop policy if exists "productos activos visibles" on marketplace_products;

create policy "catalogo tutores" on tutors
  for select to anon, authenticated using (true);
create policy "catalogo rutas" on routes
  for select to anon, authenticated using (true);
create policy "catalogo unidades" on units
  for select to anon, authenticated using (true);
create policy "catalogo lecciones" on lessons
  for select to anon, authenticated using (true);
create policy "planes activos visibles" on plans
  for select to anon, authenticated using (state = 'activo');
create policy "productos activos visibles" on marketplace_products
  for select to anon, authenticated using (is_active = true);
