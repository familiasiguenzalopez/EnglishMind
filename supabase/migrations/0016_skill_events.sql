-- ════════════════════════════════════════════════════════════
-- 0016 · "Hilo de aprendizaje": registro longitudinal de errores y mejoras.
-- Cada práctica (conversación / escritura / pronunciación) inserta UNA fila
-- centinela (category '__session__') + una fila por foco de mejora detectado.
-- Con esto se calcula si el alumno repite o SUPERA un patrón (clean streak).
-- RLS owner-only (es dato del propio alumno; medir sin vigilar).
-- ════════════════════════════════════════════════════════════

create table if not exists skill_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  batch_id uuid not null,
  source text not null,           -- conversation | writing | pronunciation
  lesson_id uuid,                 -- nullable (práctica libre)
  category text not null,         -- tag del taxonomy ('__session__' = centinela)
  label text,                     -- nombre legible (cache)
  note text,                      -- instancia concreta + sugerencia (corta)
  level text                      -- CEFR al momento
);

alter table skill_events enable row level security;

drop policy if exists "skill_events own select" on skill_events;
create policy "skill_events own select" on skill_events for select using (auth.uid() = user_id);

drop policy if exists "skill_events own insert" on skill_events;
create policy "skill_events own insert" on skill_events for insert with check (auth.uid() = user_id);

drop policy if exists "skill_events own delete" on skill_events;
create policy "skill_events own delete" on skill_events for delete using (auth.uid() = user_id);

create index if not exists skill_events_user_idx on skill_events (user_id, created_at desc);
create index if not exists skill_events_user_cat_idx on skill_events (user_id, category);
