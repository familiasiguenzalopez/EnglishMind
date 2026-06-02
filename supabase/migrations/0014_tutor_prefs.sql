-- ════════════════════════════════════════════════════════════
-- Personalización del tutor: acento (voz), tono y voz automática.
-- ════════════════════════════════════════════════════════════
alter table profiles add column if not exists tutor_accent text;
alter table profiles add column if not exists tutor_tone text;
alter table profiles add column if not exists voice_autoplay boolean not null default true;
