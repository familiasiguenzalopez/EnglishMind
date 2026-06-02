-- ════════════════════════════════════════════════════════════
-- 0015 · Lecciones de DESTREZA (pronunciacion y escritura) dentro de las
-- unidades existentes, para que el camino mezcle destrezas. Cada lit de
-- pronunciacion trae { goal, reference } (frase para leer/evaluar); cada una de
-- escritura { goal, prompt, genre, level }. Idempotente (borra y reinserta).
-- Sin apostrofes ni acentos en el texto (consistente con 0005/0006). Empareja
-- unidades por route.slug + unit.sort_order (no depende de titulos acentuados).
-- ════════════════════════════════════════════════════════════

delete from lessons l
using units u, routes r
where l.unit_id = u.id and u.route_id = r.id
  and r.slug in ('call-center', 'entrevista', 'trabajo-remoto', 'migracion', 'cotidiano')
  and l.kind in ('pronunciation', 'writing');

-- ── CALL CENTER ────────────────────────────────────────────
-- U1 (A2): abrir y cerrar
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: saludo de apertura', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia con claridad un saludo de apertura.',
    'reference', 'Thank you for calling. How can I help you today?'
  ), 8
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: apertura de llamada', 'writing',
  jsonb_build_object(
    'goal', 'Redacta una apertura cordial.',
    'prompt', 'Escribe un saludo de apertura para una llamada de soporte (2 a 3 lineas).',
    'genre', 'Servicio al cliente',
    'level', 'A2'
  ), 9
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 1;

-- U2 (B1): espera y transferir
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: poner en espera', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia una frase de espera con fluidez.',
    'reference', 'Let me put you on hold for a moment while I check that.'
  ), 8
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: explicar una transferencia', 'writing',
  jsonb_build_object(
    'goal', 'Explica una transferencia con claridad.',
    'prompt', 'Escribe como le explicarias a un cliente que vas a transferir su llamada y por que.',
    'genre', 'Servicio al cliente',
    'level', 'B1'
  ), 9
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 2;

-- U3 (B2): manejar una queja
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: frase de empatia', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia una frase de empatia con buen ritmo.',
    'reference', 'I completely understand how frustrating this must be for you.'
  ), 8
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 3;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: respuesta a una queja', 'writing',
  jsonb_build_object(
    'goal', 'Responde con empatia y una solucion.',
    'prompt', 'Escribe una respuesta empatica a un cliente molesto y ofrece una solucion.',
    'genre', 'Servicio al cliente',
    'level', 'B2'
  ), 9
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 3;

-- ── ENTREVISTA (B1) ────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: hablar con seguridad', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia una afirmacion con seguridad.',
    'reference', 'I am confident that my experience makes me a strong candidate.'
  ), 8
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: Tell me about yourself', 'writing',
  jsonb_build_object(
    'goal', 'Preparate para Tell me about yourself.',
    'prompt', 'Escribe de 3 a 4 lineas para responder Tell me about yourself.',
    'level', 'B1'
  ), 9
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 1;

-- ── TRABAJO REMOTO (B1) ────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: tu update del daily', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia tu update del daily con claridad.',
    'reference', 'Yesterday I finished the report and today I will start testing.'
  ), 8
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: update en Slack', 'writing',
  jsonb_build_object(
    'goal', 'Escribe tu update del daily.',
    'prompt', 'Escribe un mensaje de Slack con tu update: ayer, hoy y bloqueos.',
    'genre', 'Mensaje de Slack',
    'level', 'B1'
  ), 9
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 1;

-- ── MIGRACION (A2) ─────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: datos de una cita', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia los datos de una cita con claridad.',
    'reference', 'I have an appointment with the doctor at three in the afternoon.'
  ), 8
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: pedir una cita por correo', 'writing',
  jsonb_build_object(
    'goal', 'Pide una cita por correo.',
    'prompt', 'Escribe un correo corto para pedir una cita en una oficina.',
    'genre', 'Email a tu jefe',
    'level', 'A2'
  ), 9
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 1;

-- ── COTIDIANO (A2) ─────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Pronunciacion: pedir en un restaurante', 'pronunciation',
  jsonb_build_object(
    'goal', 'Pronuncia un pedido cortes en un restaurante.',
    'reference', 'Could I have the menu, please? And some water, thank you.'
  ), 8
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Escritura: reservar una mesa', 'writing',
  jsonb_build_object(
    'goal', 'Escribe un mensaje para reservar.',
    'prompt', 'Escribe un mensaje corto para reservar una mesa para dos personas.',
    'genre', 'Servicio al cliente',
    'level', 'A2'
  ), 9
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 1;
