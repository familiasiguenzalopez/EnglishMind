-- ════════════════════════════════════════════════════════════
-- 0018 · Segunda unidad para las rutas que tenían solo una (entrevista,
-- trabajo-remoto, migracion, cotidiano), subiendo el nivel CEFR. Cada unidad =
-- mini-ciclo conversar (2 escenarios) → pronunciar → escribir.
-- Idempotente: borra la unidad sort_order=2 de esas rutas y reinserta (las
-- lecciones caen por cascade). Sin apostrofes/acentos ni ';' dentro del texto.
-- ════════════════════════════════════════════════════════════

delete from units u using routes r
where u.route_id = r.id
  and r.slug in ('entrevista', 'trabajo-remoto', 'migracion', 'cotidiano')
  and u.sort_order = 2;

-- ── ENTREVISTA · Unidad 2 (B2) ─────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Entrevista a fondo', 'B2',
  'Ya puedes hablar de logros y cerrar una entrevista con seguridad.', 2
from routes where slug = 'entrevista';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Hablar de un logro', 'scenario',
  jsonb_build_object(
    'goal', 'Cuenta un logro profesional con un ejemplo concreto.',
    'scenario', 'You are a hiring manager. Ask the candidate to describe a professional achievement they are proud of, and follow up with one question.',
    'starter', 'Tell me about an achievement you are really proud of.'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Por que deberiamos contratarte', 'scenario',
  jsonb_build_object(
    'goal', 'Argumenta tu valor con seguridad y sin sonar arrogante.',
    'scenario', 'You are an interviewer closing the interview. Ask why the company should hire them over other candidates, and react to the answer.',
    'starter', 'Why should we hire you over other candidates?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: venderte con claridad', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia una frase de venta personal con buen ritmo.',
    'reference', 'I am a reliable team player who learns quickly under pressure.'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: correo de seguimiento', 'writing',
  jsonb_build_object(
    'goal', 'Escribe un correo breve de agradecimiento tras la entrevista.',
    'prompt', 'Escribe un correo corto de agradecimiento despues de una entrevista, reafirmando tu interes.',
    'genre', 'Email a tu jefe',
    'level', 'B2'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 2;

-- ── TRABAJO REMOTO · Unidad 2 (B2) ─────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Reuniones y feedback', 'B2',
  'Ya puedes liderar parte de una reunion y dar o recibir feedback.', 2
from routes where slug = 'trabajo-remoto';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Liderar parte de una reunion', 'scenario',
  jsonb_build_object(
    'goal', 'Presenta un avance y maneja una pregunta del equipo.',
    'scenario', 'You are a colleague in a video meeting. The student presents a short update on a project, then you ask one clarifying question.',
    'starter', 'Okay, over to you. Can you walk us through the project status?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Dar y recibir feedback', 'scenario',
  jsonb_build_object(
    'goal', 'Recibe feedback con apertura y responde con un plan.',
    'scenario', 'You are a teammate. Give the student brief constructive feedback on their last task and respond to their reply.',
    'starter', 'Can I share some quick feedback on the last task?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: reuniones por video', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia frases utiles para videollamadas.',
    'reference', 'Sorry, you cut out for a second. Could you repeat the last part?'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: resumen de reunion', 'writing',
  jsonb_build_object(
    'goal', 'Escribe un resumen claro con acuerdos y proximos pasos.',
    'prompt', 'Escribe un resumen corto de una reunion con los acuerdos y los proximos pasos.',
    'genre', 'Mensaje de Slack',
    'level', 'B1'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 2;

-- ── MIGRACION · Unidad 2 (B1) ──────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Vivienda y servicios', 'B1',
  'Ya puedes alquilar vivienda y abrir servicios basicos en ingles.', 2
from routes where slug = 'migracion';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Alquilar un apartamento', 'scenario',
  jsonb_build_object(
    'goal', 'Pregunta por renta, deposito y servicios.',
    'scenario', 'You are a landlord showing an apartment. Answer the student questions about the rent, the deposit and the utilities.',
    'starter', 'Hi! So this is the apartment. What would you like to know?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Abrir una cuenta de banco', 'scenario',
  jsonb_build_object(
    'goal', 'Abre una cuenta y entiende los documentos que piden.',
    'scenario', 'You are a bank teller. Help the student open a basic checking account and ask for the documents you need.',
    'starter', 'Welcome! How can I help you today?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: datos y cantidades', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia con claridad una pregunta sobre dinero.',
    'reference', 'Could you tell me the monthly rent and the deposit, please?'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: correo al arrendador', 'writing',
  jsonb_build_object(
    'goal', 'Reporta un problema de la vivienda con claridad.',
    'prompt', 'Escribe un correo corto para reportar un problema en tu apartamento al arrendador.',
    'genre', 'Servicio al cliente',
    'level', 'B1'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 2;

-- ── COTIDIANO · Unidad 2 (B1) ──────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Viajes y emergencias', 'B1',
  'Ya puedes resolver imprevistos de viaje y pedir ayuda basica.', 2
from routes where slug = 'cotidiano';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'En la farmacia', 'scenario',
  jsonb_build_object(
    'goal', 'Describe un sintoma leve y entiende como tomar algo.',
    'scenario', 'You are a pharmacist. The student describes a minor symptom, then you recommend something simple and explain how to take it.',
    'starter', 'Hi, how can I help you today?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Un problema con tu reserva', 'scenario',
  jsonb_build_object(
    'goal', 'Resuelve un imprevisto con calma y cortesia.',
    'scenario', 'You are a hotel receptionist. The student has a problem with a reservation, and you help them solve it calmly.',
    'starter', 'Front desk, how can I help?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: pedir ayuda', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia una peticion de ayuda con claridad.',
    'reference', 'Excuse me, I think I missed my connection. Can you help me?'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: un reclamo cortes', 'writing',
  jsonb_build_object(
    'goal', 'Escribe un reclamo claro y cortes.',
    'prompt', 'Escribe un mensaje corto para reclamar un cargo o un problema con una reserva.',
    'genre', 'Servicio al cliente',
    'level', 'B1'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 2;
