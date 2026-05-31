-- ════════════════════════════════════════════════════════════
-- EnglishMind AI · Seed de ejemplo (Fase 0)
-- Tutores, rutas, planes y configuración del orquestador.
-- Ejecutar tras las migraciones (supabase db reset usa este archivo).
-- ════════════════════════════════════════════════════════════

-- ── 6 tutores con rol pedagógico ───────────────────────────
insert into tutors (slug, name, role, accent, persona, emoji, sort_order) values
  ('valentina', 'Valentina', 'Coach de principiantes: ritmo lento, mucho refuerzo', 'Latino neutro', 'Cálida, paciencia infinita', '🌟', 1),
  ('marcus',    'Marcus',    'Pronunciación y fonética',                            'EE. UU. claro', 'Directo pero alentador',    '🗣️', 2),
  ('sofia',     'Sofía',     'Conversación cotidiana y confianza para hablar',      'Latino neutro', 'Cercana, divertida',        '💬', 3),
  ('james',     'James',     'Negocios, entrevistas y call center',                 'Formal',        'Profesional, estructurado', '💼', 4),
  ('luna',      'Luna',      'Escritura y gramática: explica el porqué',            'Latino neutro', 'Analítica, amable con el error', '✍️', 5),
  ('miguel',    'Miguel',    'Migración y vida en EE. UU.',                         'Latino neutro', 'Empático; "ha estado ahí"', '🧭', 6);

-- ── Rutas de currículo (call center = estrella) ────────────
insert into routes (slug, name, description, sort_order) values
  ('call-center',      'Call center / servicio al cliente', 'La ruta estrella del mercado', 1),
  ('trabajo-remoto',   'Trabajo remoto / tech / freelance', 'Emails, Slack, reuniones, dailies', 2),
  ('entrevista',       'Entrevista de trabajo',             'Intensiva, corta, de alto impacto', 3),
  ('migracion',        'Migración y vida en EE. UU.',       'Trámites, comunidad, situaciones reales', 4),
  ('cotidiano',        'Inglés cotidiano / viaje',          'Base general', 5),
  ('certificacion',    'Certificación CEFR',                'Para quien necesita el papel', 6);

-- ── Planes personales (4) ──────────────────────────────────
insert into plans (code, name, audience, state, price_month, annual_discount, trial_days, ai_tier, features) values
  ('free',    'Gratis · Empieza',     'personal', 'activo', 0.00,  0,  0, 'Nivel 2-3',
    '{"voz_min_dia":10,"tutores":1,"rutas":1,"cert_anio":0,"yo_antes":true}'::jsonb),
  ('basico',  'Básico · Constancia',  'personal', 'activo', 4.99,  20, 7, 'Nivel 1-2',
    '{"voz_min_dia":60,"tutores":6,"rutas":"todas","offline":true,"cert_anio":1}'::jsonb),
  ('pro',     'Pro · Despega',        'personal', 'activo', 9.99,  20, 7, 'Nivel 1',
    '{"voz":"ilimitada","tutores":6,"cert_anio":"ilimitado","yo_futuro_voz":true,"marketplace_usd":5}'::jsonb),
  ('premium', 'Premium · Tu Yo Pro',  'personal', 'activo', 19.99, 15, 7, 'Nivel 1',
    '{"voz":"ilimitada","yo_futuro_video":true,"sesion_humana_mes":1,"marketplace_usd":15}'::jsonb);

-- ── Planes para colegios (3, precio por alumno-mes) ────────
insert into plans (code, name, audience, state, price_month, annual_discount, ai_tier, features) values
  ('aula',        'Aula',        'colegio', 'activo', 3.50, 20, 'Nivel 1-2',
    '{"min_alumnos":25,"docentes":1,"alta":"csv","branding":false}'::jsonb),
  ('institucion', 'Institución', 'colegio', 'activo', 2.75, 20, 'Nivel 1',
    '{"min_alumnos":100,"docentes":10,"alta":"csv+sso","branding":"ligero"}'::jsonb),
  ('alianza',     'Alianza',     'colegio', 'activo', 2.00, 20, 'Nivel 1',
    '{"min_alumnos":500,"managers":"ilimitados","alta":"csv+sso","api":true,"branding":"personalizado"}'::jsonb);

-- ── Orquestador: 9 funcionalidades × 3 niveles ─────────────
-- (Nivel 1 activo por defecto. Las API keys NO se guardan aquí.)
insert into orchestrator_config (feature, tier, provider, model, is_active) values
  ('voz', 1, 'OpenAI / Google', 'GPT-Realtime-2/mini · Gemini Live', true),
  ('voz', 2, 'Google', 'Gemini Live free tier / pipeline STT+LLM+TTS', false),
  ('voz', 3, 'Open-source', 'gpt-realtime-mini · Whisper+LLM+Cartesia', false),
  ('pronunciacion', 1, 'Azure', 'Speech Pronunciation Assessment', true),
  ('pronunciacion', 2, 'Azure', 'free tier / fonémico sobre Whisper', false),
  ('pronunciacion', 3, 'Open-source', 'modelos de pronunciación open', false),
  ('escritura', 1, 'Anthropic', 'Claude Sonnet/Opus + LanguageTool', true),
  ('escritura', 2, 'Google', 'Gemini Flash + LanguageTool self-host', false),
  ('escritura', 3, 'Open-source', 'DeepSeek/Llama self-host', false),
  ('cerebro', 1, 'Anthropic / Google', 'Claude Opus/Sonnet · Gemini 3.1 Pro', true),
  ('cerebro', 2, 'Google / OpenAI', 'Gemini 3.5 Flash / GPT-mini', false),
  ('cerebro', 3, 'Google / Open', 'Gemini Flash-Lite / open', false),
  ('tts', 1, 'ElevenLabs', 'Expressive + voz clonada', true),
  ('tts', 2, 'OpenAI / Google', 'gpt-4o-mini-tts / Google TTS', false),
  ('tts', 3, 'Open-source', 'Cartesia / Coqui', false),
  ('avatar', 1, 'HeyGen', 'LiveAvatar / Avatar IV', true),
  ('avatar', 2, 'HeyGen / D-ID', 'Photo Avatar / D-ID', false),
  ('avatar', 3, 'Open-source', 'Lipsync (Veo/Kling)', false),
  ('busqueda', 1, 'Anthropic / Google', 'Claude web search / Gemini grounding', true),
  ('busqueda', 2, 'Google', 'Gemini free grounding', false),
  ('busqueda', 3, 'Varios', 'API de búsqueda económica', false),
  ('stt', 1, 'OpenAI / Azure', 'GPT-Realtime-Whisper / Azure STT', true),
  ('stt', 2, 'Open-source / Deepgram', 'Whisper self-host / Deepgram', false),
  ('stt', 3, 'Open-source', 'nuevos de prueba', false),
  ('imagen', 1, 'Premium', 'modelo de imagen de gama alta', true),
  ('imagen', 2, 'Free-tier', 'generador de imagen free', false),
  ('imagen', 3, 'Open-source', 'SDXL / Flux self-host', false);

-- ── Marketplace (catálogo de ejemplo) ──────────────────────
insert into marketplace_products (category, title, description, price_usd) values
  ('Paquete', 'Intensivo de Entrevista', '2 semanas: tell me about yourself, fortalezas, salary expectations.', 6.99),
  ('Paquete', 'Bootcamp Call Center', 'De-escalation, empathy statements, manejo de llamada y acentos de EE. UU.', 9.99),
  ('Paquete', 'Inglés para Migración', 'Trámites, escuela, médico y situaciones reales en EE. UU.', 5.99),
  ('Potenciador', '+300 min de conversación', 'Minutos extra de voz con tu tutor este mes.', 3.99),
  ('Potenciador', 'Desbloqueo Nivel 1 (7 días)', 'Los mejores modelos de IA por una semana.', 2.99),
  ('Asesoría humana', 'Sesión 1:1 con especialista', '45 min con un coach real: conversación, corrección o entrevista.', 12.00);
