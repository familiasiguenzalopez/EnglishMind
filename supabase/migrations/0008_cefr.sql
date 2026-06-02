-- ════════════════════════════════════════════════════════════
-- Nivel CEFR del placement ("para conocerte"). Se guarda en el perfil.
-- ════════════════════════════════════════════════════════════
alter table profiles add column if not exists cefr_level text;
