-- ════════════════════════════════════════════════════════════
-- Repetición espaciada (SM-2 simplificado). Tarjetas por usuario.
-- ════════════════════════════════════════════════════════════
create table if not exists review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  front text not null,
  back text not null,
  ease numeric(4, 2) not null default 2.5,
  interval_days int not null default 0,
  reps int not null default 0,
  due_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists review_items_due_idx on review_items (user_id, due_at);

alter table review_items enable row level security;

create policy "repaso propio" on review_items
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
