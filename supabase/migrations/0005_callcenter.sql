-- ════════════════════════════════════════════════════════════
-- Contenido de la ruta CALL CENTER (la estrella). 3 unidades, 6 lecciones
-- de escenario. Idempotente: borra las unidades de call-center y reinserta
-- (las lecciones caen por ON DELETE CASCADE). Sin apóstrofes en el texto EN
-- para evitar problemas de escape en SQL.
-- ════════════════════════════════════════════════════════════

delete from units u using routes r
where r.id = u.route_id and r.slug = 'call-center';

-- Unidades
insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Abrir y cerrar una llamada', 'A2',
  'Ya puedes saludar, identificarte y cerrar una llamada con cortesia.', 1
from routes where slug = 'call-center';

insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Poner en espera y transferir', 'B1',
  'Ya puedes poner en espera y transferir explicando el porque.', 2
from routes where slug = 'call-center';

insert into units (route_id, title, cefr_target, can_do, sort_order)
select id, 'Manejar una queja sin perder el tono', 'B2',
  'Ya puedes resolver una queja dificil con empatia.', 3
from routes where slug = 'call-center';

-- Lecciones (escenario: el tutor hace de CLIENTE; el alumno es el AGENTE)
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Saludo y apertura', 'scenario',
  jsonb_build_object(
    'goal', 'Practica saludar, identificarte y preguntar en que puedes ayudar.',
    'scenario', 'You are a friendly customer who just called a US company support line. Wait for the agent to greet you, then say your internet has been very slow today.',
    'starter', 'Hi, is anyone there? My internet has been really slow today.'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.title = 'Abrir y cerrar una llamada';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Cierre cortes', 'scenario',
  jsonb_build_object(
    'goal', 'Practica cerrar la llamada con cortesia y confirmar los proximos pasos.',
    'scenario', 'You are a customer whose problem was just solved. Thank the agent warmly and let them close the call.',
    'starter', 'Oh great, it is working now! Thank you so much for your help.'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.title = 'Abrir y cerrar una llamada';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Poner en espera', 'scenario',
  jsonb_build_object(
    'goal', 'Pide permiso para poner en espera y explica por que.',
    'scenario', 'You are a customer calling about a charge on your bill you do not recognize. React naturally when the agent asks to put you on hold.',
    'starter', 'Hello, I am calling about a charge on my bill that I do not recognize.'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.title = 'Poner en espera y transferir';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Transferir al area correcta', 'scenario',
  jsonb_build_object(
    'goal', 'Transfiere la llamada al area correcta explicando el motivo.',
    'scenario', 'You are a customer who reached the wrong department; you actually need technical support for a broken router. Let the agent transfer you.',
    'starter', 'Hi, I think my router is broken, can you help me fix it?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.title = 'Poner en espera y transferir';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Calmar a un cliente molesto', 'scenario',
  jsonb_build_object(
    'goal', 'Calma a un cliente molesto con empatia antes de resolver.',
    'scenario', 'You are an UPSET customer: your service has been down for two days and you are frustrated. Stay firm but not abusive; calm down only if the agent shows real empathy.',
    'starter', 'This is ridiculous! Two days with no service and nobody has called me back!'
  ), 1
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.title = 'Manejar una queja sin perder el tono';

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Frases de empatia y solucion', 'scenario',
  jsonb_build_object(
    'goal', 'Usa frases de empatia y ofrece una solucion clara.',
    'scenario', 'You are a worried customer who was charged twice and needs the money back soon. Respond to the agent empathy and proposed solution.',
    'starter', 'I was charged twice and I really need that money back, what can you do?'
  ), 2
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.title = 'Manejar una queja sin perder el tono';
