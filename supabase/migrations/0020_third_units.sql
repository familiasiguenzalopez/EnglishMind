-- ════════════════════════════════════════════════════════════
-- 0020 · Tercera unidad para las rutas con dos (entrevista, trabajo-remoto a
-- C1; migracion, cotidiano a B2). Ciclo completo: vocab → 2 escenarios →
-- pronunciacion → escritura. Idempotente (borra unit sort_order=3 y reinserta).
-- Sin apostrofes/acentos ni ';' en el texto. (call-center ya tiene 3 unidades.)
-- ════════════════════════════════════════════════════════════

delete from units u using routes r
where u.route_id = r.id
  and r.slug in ('entrevista', 'trabajo-remoto', 'migracion', 'cotidiano')
  and u.sort_order = 3;

-- ── ENTREVISTA · Unidad 3 (C1) ─────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Negociacion y cierre', 'C1',
  'Ya puedes negociar una oferta y manejar preguntas dificiles con soltura.', 3
from routes where slug = 'entrevista';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: negociacion', 'vocab',
  jsonb_build_object('goal', 'Vocabulario para negociar una oferta.', 'words',
  '[{"en":"counteroffer","es":"contraoferta","example":"I would like to make a counteroffer."},{"en":"benefits","es":"beneficios","example":"What benefits does the role include?"},{"en":"relocation","es":"reubicacion","example":"Is relocation support available?"},{"en":"long-term","es":"a largo plazo","example":"I am thinking long-term about this role."},{"en":"trade-off","es":"concesion","example":"There is always a trade-off."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Negociar la oferta', 'scenario',
  jsonb_build_object(
    'goal', 'Negocia salario o beneficios con tacto.',
    'scenario', 'You are an HR manager extending a job offer. The student negotiates salary or benefits politely, and you respond reasonably.',
    'starter', 'We would like to offer you the position. Let us talk about the details.'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Una pregunta dificil', 'scenario',
  jsonb_build_object(
    'goal', 'Responde una pregunta de comportamiento con calma.',
    'scenario', 'You are an interviewer. Ask about a time the student failed at something and what they learned, then probe a bit deeper.',
    'starter', 'Tell me about a time you failed at something important.'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: negociar con calma', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia una frase de negociacion con seguridad.',
    'reference', 'I am confident we can find an arrangement that works for both of us.'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: negociar por correo', 'writing',
  jsonb_build_object(
    'goal', 'Negocia la oferta por correo con tacto.',
    'prompt', 'Escribe un correo para negociar la oferta: agradece, propone un ajuste y manten el tono positivo.',
    'genre', 'Email a tu jefe',
    'level', 'C1'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 3;

-- ── TRABAJO REMOTO · Unidad 3 (C1) ─────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Conflictos y decisiones', 'C1',
  'Ya puedes discrepar con respeto y presentar una recomendacion clara.', 3
from routes where slug = 'trabajo-remoto';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: decisiones', 'vocab',
  jsonb_build_object('goal', 'Vocabulario para alinear y decidir.', 'words',
  '[{"en":"to align","es":"alinearse","example":"Let us align on the goal first."},{"en":"stakeholder","es":"parte interesada","example":"We need to inform the stakeholders."},{"en":"to escalate","es":"escalar","example":"I will escalate this if needed."},{"en":"consensus","es":"consenso","example":"We reached a consensus."},{"en":"trade-off","es":"concesion","example":"Every option has a trade-off."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Estar en desacuerdo con respeto', 'scenario',
  jsonb_build_object(
    'goal', 'Defiende tu punto sin cerrar la conversacion.',
    'scenario', 'You are a senior colleague. The student disagrees with your proposal, and you defend your view but stay open to theirs.',
    'starter', 'I think we should ship it now. What is your take?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Presentar una recomendacion', 'scenario',
  jsonb_build_object(
    'goal', 'Presenta una recomendacion con pros y contras.',
    'scenario', 'You are a manager. The student presents a recommendation with trade-offs, and you ask one hard follow-up question.',
    'starter', 'Okay, what do you recommend, and why?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: discrepar con tacto', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia un desacuerdo respetuoso con claridad.',
    'reference', 'I see your point, but I would suggest a different approach for the long term.'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: proponer una decision', 'writing',
  jsonb_build_object(
    'goal', 'Propon una decision con pros, contras y recomendacion.',
    'prompt', 'Escribe un mensaje proponiendo una decision con pros, contras y una recomendacion clara.',
    'genre', 'Mensaje de Slack',
    'level', 'B2'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 3;

-- ── MIGRACION · Unidad 3 (B2) ──────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Salud y derechos', 'B2',
  'Ya puedes manejar una cita medica con detalle y resolver un tramite trabado.', 3
from routes where slug = 'migracion';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: salud y tramites', 'vocab',
  jsonb_build_object('goal', 'Vocabulario de salud y tramites.', 'words',
  '[{"en":"insurance","es":"seguro","example":"Do you have health insurance?"},{"en":"prescription","es":"receta","example":"Here is your prescription."},{"en":"symptoms","es":"sintomas","example":"What are your symptoms?"},{"en":"paperwork","es":"papeleo","example":"There is a lot of paperwork."},{"en":"missing","es":"faltante","example":"One document is missing."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Cita medica con detalles', 'scenario',
  jsonb_build_object(
    'goal', 'Describe sintomas e historial y entiende el tratamiento.',
    'scenario', 'You are a doctor. Ask the student about their symptoms, history and allergies, then explain a simple treatment.',
    'starter', 'What seems to be the problem today?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Un tramite rechazado', 'scenario',
  jsonb_build_object(
    'goal', 'Aclara que falta y cual es el siguiente paso.',
    'scenario', 'You are an office official. The student had their paperwork rejected, and you explain calmly what is missing and the next step.',
    'starter', 'I am sorry, but this application is incomplete.'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: pedir aclaracion', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia una peticion de aclaracion con claridad.',
    'reference', 'I would like to understand exactly which documents are still missing.'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: correo formal de tramite', 'writing',
  jsonb_build_object(
    'goal', 'Pide una correccion o cita por un tramite por correo.',
    'prompt', 'Escribe un correo formal pidiendo una correccion o una cita por un tramite rechazado.',
    'genre', 'Servicio al cliente',
    'level', 'B2'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 3;

-- ── COTIDIANO · Unidad 3 (B2) ──────────────────────────────
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Imprevistos y vida social', 'B2',
  'Ya puedes hacer planes, socializar y reclamar como cliente con cortesia.', 3
from routes where slug = 'cotidiano';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: vida social', 'vocab',
  jsonb_build_object('goal', 'Vocabulario para socializar y resolver.', 'words',
  '[{"en":"to make plans","es":"hacer planes","example":"Let us make plans for Saturday."},{"en":"to catch up","es":"ponerse al dia","example":"Let us catch up soon."},{"en":"a refund","es":"un reembolso","example":"Can I get a refund?"},{"en":"to recommend","es":"recomendar","example":"What do you recommend?"},{"en":"by the way","es":"por cierto","example":"By the way, nice to meet you."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Hacer planes con un amigo', 'scenario',
  jsonb_build_object(
    'goal', 'Propon un plan y reacciona con naturalidad.',
    'scenario', 'You are a friend. Make plans for the weekend with the student and react naturally to their ideas.',
    'starter', 'Hey! Any plans for the weekend?'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Reclamar con cortesia', 'scenario',
  jsonb_build_object(
    'goal', 'Haz un reclamo claro y educado como cliente.',
    'scenario', 'You are a store manager. The student has a complaint about a product, and you handle it politely.',
    'starter', 'Hi, how can I help you today?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: un comentario amable', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia un comentario amable pero firme.',
    'reference', 'I really enjoyed it, but there is one small thing I wanted to mention.'
  ), 3
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: una invitacion', 'writing',
  jsonb_build_object(
    'goal', 'Invita a alguien a un plan y propon dia y hora.',
    'prompt', 'Escribe un mensaje para invitar a alguien a un plan y proponer dia y hora.',
    'genre', 'Mensaje de Slack',
    'level', 'B1'
  ), 4
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 3;
