-- ════════════════════════════════════════════════════════════
-- Contenido de escenarios para 4 rutas más: Entrevista, Trabajo remoto,
-- Migración y Cotidiano. Mismo patrón que call-center (tutor = el otro rol;
-- alumno practica). Idempotente. Sin apóstrofes en el texto EN.
-- ════════════════════════════════════════════════════════════

delete from units u using routes r
where r.id = u.route_id
  and r.slug in ('entrevista', 'trabajo-remoto', 'migracion', 'cotidiano');

-- ── ENTREVISTA ─────────────────────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Preguntas clásicas de entrevista', 'B1',
  'Ya puedes responder las preguntas mas comunes de una entrevista.', 1
from routes where slug = 'entrevista';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Tell me about yourself', 'scenario',
  jsonb_build_object(
    'goal', 'Practica una respuesta breve y enfocada a "tell me about yourself".',
    'scenario', 'You are a friendly hiring manager interviewing the student for a customer support role. Ask them to tell you about themselves and react to their answer.',
    'starter', 'Thanks for coming in today. So, tell me a little about yourself.'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.title = 'Preguntas clásicas de entrevista';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Fortalezas y debilidades', 'scenario',
  jsonb_build_object(
    'goal', 'Habla de una fortaleza y una debilidad con un ejemplo concreto.',
    'scenario', 'You are an interviewer. Ask about the student biggest strength and one weakness, and follow up with a short question.',
    'starter', 'Great. What would you say is your biggest strength?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.title = 'Preguntas clásicas de entrevista';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Expectativas de salario', 'scenario',
  jsonb_build_object(
    'goal', 'Habla de expectativas salariales con tacto.',
    'scenario', 'You are an interviewer discussing compensation. Ask the student about salary expectations and respond reasonably.',
    'starter', 'Let us talk about compensation. What are your salary expectations?'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.title = 'Preguntas clásicas de entrevista';

-- ── TRABAJO REMOTO ─────────────────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Comunicación en equipo remoto', 'B1',
  'Ya puedes dar tu update en un daily y pedir ayuda con claridad.', 1
from routes where slug = 'trabajo-remoto';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Daily stand-up', 'scenario',
  jsonb_build_object(
    'goal', 'Da tu update: ayer, hoy y bloqueos.',
    'scenario', 'You are a teammate hosting a remote daily stand-up. Greet the student and ask for their update, then react briefly.',
    'starter', 'Morning! Want to kick us off? What did you work on yesterday?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.title = 'Comunicación en equipo remoto';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pedir ayuda en un blocker', 'scenario',
  jsonb_build_object(
    'goal', 'Explica un bloqueo y pide ayuda de forma clara.',
    'scenario', 'You are a senior teammate on a call. The student has a blocker; ask clarifying questions and offer help.',
    'starter', 'You mentioned you are blocked. What is going on?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.title = 'Comunicación en equipo remoto';

-- ── MIGRACIÓN ──────────────────────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Trámites y vida diaria', 'A2',
  'Ya puedes manejar una cita y situaciones basicas de tramites.', 1
from routes where slug = 'migracion';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Cita en una oficina', 'scenario',
  jsonb_build_object(
    'goal', 'Explica por que vienes y da tus datos.',
    'scenario', 'You are a front-desk clerk at a government office. Greet the student, ask why they are here, and ask for an ID.',
    'starter', 'Good morning. How can I help you today?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.title = 'Trámites y vida diaria';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Inscribir a un hijo en la escuela', 'scenario',
  jsonb_build_object(
    'goal', 'Pide inscribir a tu hijo y pregunta por los documentos.',
    'scenario', 'You are a school secretary. The student wants to enroll their child; ask what they need and which documents they have.',
    'starter', 'Hi there, are you here to register a student?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.title = 'Trámites y vida diaria';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'En el consultorio médico', 'scenario',
  jsonb_build_object(
    'goal', 'Describe un sintoma simple y entiende instrucciones.',
    'scenario', 'You are a nurse at a clinic. Ask the student what brings them in today and respond with simple instructions.',
    'starter', 'Hello, what brings you in today?'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.title = 'Trámites y vida diaria';

-- ── COTIDIANO ──────────────────────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Situaciones del día a día', 'A2',
  'Ya puedes pedir comida y orientarte en un viaje.', 1
from routes where slug = 'cotidiano';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pedir en un restaurante', 'scenario',
  jsonb_build_object(
    'goal', 'Ordena comida y haz una pregunta sobre el menu.',
    'scenario', 'You are a waiter at a casual restaurant. Greet the student and take their order, and answer one menu question.',
    'starter', 'Hi, welcome! Can I start you off with something to drink?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.title = 'Situaciones del día a día';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pedir indicaciones', 'scenario',
  jsonb_build_object(
    'goal', 'Pregunta como llegar a un lugar y confirma.',
    'scenario', 'You are a friendly local. The student asks for directions to a train station; give simple, short directions.',
    'starter', 'You look a little lost, do you need help finding something?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.title = 'Situaciones del día a día';
