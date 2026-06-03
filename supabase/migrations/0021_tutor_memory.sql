-- ════════════════════════════════════════════════════════════
-- 0021 · Memoria del tutor entre sesiones (patrón "Lily" de Duolingo).
-- Guarda hasta ~8 datos DURABLES y NO sensibles del alumno (trabajo, familia,
-- intereses, metas) para personalizar la charla libre. Privado: owner-only
-- (profiles ya tiene RLS de dueño). El alumno puede ver y borrar su memoria.
-- ════════════════════════════════════════════════════════════
alter table profiles add column if not exists tutor_memory jsonb not null default '[]'::jsonb;
