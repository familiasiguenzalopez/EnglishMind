-- ════════════════════════════════════════════════════════════
-- EnglishMind AI · Schema v1 (Fase 0)
-- Entidades núcleo para soportar el MVP y dejar estructura para
-- negocio (planes, orquestador) y B2B (orgs/cohortes).
-- RLS y políticas: ver 0002_rls.sql
-- ════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Tipos ──────────────────────────────────────────────────
create type plan_audience as enum ('personal', 'colegio');
create type plan_state as enum ('borrador', 'activo', 'archivado');
create type skill as enum ('speaking', 'writing', 'reading', 'listening');
create type capsule_kind as enum ('voice', 'text');
create type membership_role as enum ('admin', 'manager', 'instructor', 'learner');

-- ── Perfil de usuario (1:1 con auth.users) ─────────────────
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  native_lang text not null default 'es',
  goal text,                       -- motivación del onboarding (call center, migración, ...)
  active_tutor_id uuid,            -- FK lógica a tutors (sin enforce para evitar ciclo de seed)
  created_at timestamptz not null default now()
);

-- ── Catálogo de aprendizaje (lectura pública) ──────────────
create table tutors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text not null,              -- rol pedagógico
  accent text,
  persona text,
  emoji text,
  sort_order int not null default 0
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0
);

create table units (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes (id) on delete cascade,
  title text not null,
  cefr_target text,                -- p.ej. 'B1'
  can_do text,                     -- "Ya puedes..."
  sort_order int not null default 0
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units (id) on delete cascade,
  title text not null,
  kind text not null default 'voice',  -- voice | writing | reading | listening
  content jsonb not null default '{}'::jsonb,
  sort_order int not null default 0
);

-- ── Progreso del usuario (privado, owner-only) ─────────────
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  status text not null default 'in_progress', -- in_progress | done
  xp int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table skill_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill skill not null,
  cefr text,
  score numeric(5, 2),
  updated_at timestamptz not null default now(),
  unique (user_id, skill)
);

-- Eventos sensibles: el contenido NUNCA es visible a managers (medir sin vigilar)
create table pronunciation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid references lessons (id) on delete set null,
  phoneme text,
  score numeric(5, 2),
  status text,                     -- correct | improve | unintelligible
  created_at timestamptz not null default now()
);

create table writing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid references lessons (id) on delete set null,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Cápsulas del tiempo (opt-in, del usuario; preferible on-device)
create table capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind capsule_kind not null,
  storage_path text,
  prompt_key text,                 -- prompt recurrente fijo (comparación justa)
  created_at timestamptz not null default now()
);

-- ── Negocio: planes y suscripciones ────────────────────────
create table plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  audience plan_audience not null default 'personal',
  state plan_state not null default 'borrador',
  price_month numeric(10, 2) not null default 0,
  annual_discount int not null default 0,    -- %
  trial_days int not null default 0,
  ai_tier text not null default 'Nivel 1',
  features jsonb not null default '{}'::jsonb,
  accent_color text,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references plans (id),
  status text not null default 'active',  -- active | canceled | past_due | trialing
  started_at timestamptz not null default now(),
  renews_at timestamptz,
  cancel_at timestamptz
);

-- ── Orquestador de IA (solo admin / service_role) ──────────
create table orchestrator_config (
  id uuid primary key default gen_random_uuid(),
  feature text not null,           -- voz | pronunciacion | escritura | cerebro | tts | avatar | busqueda | stt | imagen
  tier int not null check (tier between 1 and 3),
  provider text,
  model text,
  endpoint text,
  params jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  -- la API key NO se guarda aquí; vive en Vault/secrets del servidor
  unique (feature, tier)
);

create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  feature text not null,
  cost_usd numeric(10, 5) not null default 0,
  tokens int,
  created_at timestamptz not null default now()
);

-- ── Certificados (verificación pública por ID opaco) ───────
create table certificates (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null default encode(gen_random_bytes(9), 'hex'),
  user_id uuid not null references auth.users (id) on delete cascade,
  holder_name text,
  global_cefr text,
  skills jsonb not null default '{}'::jsonb,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked boolean not null default false
);

-- ── B2B: organizaciones y cohortes ─────────────────────────
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,                       -- empresa | colegio
  branding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table cohorts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs (id) on delete cascade,
  name text not null,
  route_id uuid references routes (id)
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  cohort_id uuid references cohorts (id) on delete set null,
  role membership_role not null default 'learner',
  unique (org_id, user_id)
);

-- ── Marketplace ────────────────────────────────────────────
create table marketplace_products (
  id uuid primary key default gen_random_uuid(),
  category text not null,          -- Paquete | Potenciador | Asesoría humana
  title text not null,
  description text,
  price_usd numeric(10, 2) not null default 0,
  is_active boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references marketplace_products (id),
  amount_usd numeric(10, 2) not null,
  method text,                     -- tarjeta | transfer365 | pay_bcr | pagadito | chivo | bitcoin
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Índices útiles
create index on progress (user_id);
create index on pronunciation_events (user_id);
create index on writing_events (user_id);
create index on subscriptions (user_id);
create index on memberships (org_id);
create index on memberships (user_id);
