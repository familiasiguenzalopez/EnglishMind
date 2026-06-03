-- ════════════════════════════════════════════════════════════
-- 0019 · Lecciones de VOCABULARIO (kind 'vocab') en cada unidad. content =
-- { goal, words:[{en,es,example}] }. Aparecen primero en la unidad (sort_order
-- 0). La actividad /vocabulario practica con tarjetas y puede sumar las palabras
-- al repaso espaciado. Idempotente. Sin apostrofes ni acentos.
-- ════════════════════════════════════════════════════════════

delete from lessons l using units u, routes r
where l.unit_id = u.id and u.route_id = r.id
  and r.slug in ('call-center', 'entrevista', 'trabajo-remoto', 'migracion', 'cotidiano')
  and l.kind = 'vocab';

-- ── CALL CENTER ────────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: saludo y apertura', 'vocab',
  jsonb_build_object('goal', 'Aprende frases clave para abrir una llamada.', 'words',
  '[{"en":"How may I help you?","es":"Como puedo ayudarle?","example":"How may I help you today?"},{"en":"May I have your name?","es":"Me da su nombre?","example":"May I have your name, please?"},{"en":"Bear with me","es":"Deme un momento","example":"Bear with me for a moment."},{"en":"I will be glad to help","es":"Con gusto le ayudo","example":"I will be glad to help you with that."},{"en":"Have a great day","es":"Que tenga buen dia","example":"Thank you for calling. Have a great day!"}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: espera y transferencia', 'vocab',
  jsonb_build_object('goal', 'Aprende frases para poner en espera y transferir.', 'words',
  '[{"en":"to put you on hold","es":"ponerlo en espera","example":"I will put you on hold for a moment."},{"en":"to transfer your call","es":"transferir su llamada","example":"I will transfer your call to billing."},{"en":"the right department","es":"el area correcta","example":"Let me connect you with the right department."},{"en":"Thanks for waiting","es":"Gracias por esperar","example":"Thanks for waiting. I have an update."},{"en":"Let me look into that","es":"Dejeme revisarlo","example":"Let me look into that for you."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 2;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: empatia y solucion', 'vocab',
  jsonb_build_object('goal', 'Aprende frases de empatia y solucion.', 'words',
  '[{"en":"I apologize for the inconvenience","es":"Lamento las molestias","example":"I apologize for the inconvenience this caused."},{"en":"I understand your frustration","es":"Entiendo su frustracion","example":"I understand your frustration, and I will help."},{"en":"Let me make this right","es":"Permitame resolverlo","example":"Let me make this right for you."},{"en":"as soon as possible","es":"lo antes posible","example":"We will fix it as soon as possible."},{"en":"a full refund","es":"un reembolso total","example":"I can offer you a full refund."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'call-center' and u.sort_order = 3;

-- ── ENTREVISTA ─────────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: entrevista basica', 'vocab',
  jsonb_build_object('goal', 'Palabras clave para una entrevista.', 'words',
  '[{"en":"strengths","es":"fortalezas","example":"One of my strengths is teamwork."},{"en":"weakness","es":"debilidad","example":"A weakness I am working on is public speaking."},{"en":"team player","es":"trabajo en equipo","example":"I am a strong team player."},{"en":"deadline","es":"fecha limite","example":"I always meet the deadline."},{"en":"responsibilities","es":"responsabilidades","example":"My main responsibilities were support and training."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: entrevista avanzada', 'vocab',
  jsonb_build_object('goal', 'Vocabulario para preguntas dificiles.', 'words',
  '[{"en":"achievement","es":"logro","example":"My biggest achievement was leading a new team."},{"en":"challenge","es":"reto","example":"I see this role as a great challenge."},{"en":"leadership","es":"liderazgo","example":"I have leadership experience from my last job."},{"en":"salary expectations","es":"expectativas salariales","example":"My salary expectations are flexible."},{"en":"notice period","es":"periodo de preaviso","example":"My notice period is two weeks."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'entrevista' and u.sort_order = 2;

-- ── TRABAJO REMOTO ─────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: equipo remoto', 'vocab',
  jsonb_build_object('goal', 'Vocabulario del dia a dia remoto.', 'words',
  '[{"en":"stand-up","es":"reunion diaria","example":"We have a stand-up every morning."},{"en":"blocker","es":"impedimento","example":"I have a blocker on this task."},{"en":"to follow up","es":"dar seguimiento","example":"I will follow up by email."},{"en":"on track","es":"en camino","example":"The project is on track."},{"en":"deadline","es":"fecha limite","example":"The deadline is Friday."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: reuniones', 'vocab',
  jsonb_build_object('goal', 'Vocabulario para reuniones efectivas.', 'words',
  '[{"en":"agenda","es":"agenda","example":"Let us stick to the agenda."},{"en":"action items","es":"tareas a seguir","example":"Here are the action items from today."},{"en":"feedback","es":"retroalimentacion","example":"Thanks for the feedback."},{"en":"to wrap up","es":"cerrar","example":"Let us wrap up the meeting."},{"en":"next steps","es":"proximos pasos","example":"What are the next steps?"}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'trabajo-remoto' and u.sort_order = 2;

-- ── MIGRACION ──────────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: tramites', 'vocab',
  jsonb_build_object('goal', 'Palabras clave para tramites.', 'words',
  '[{"en":"appointment","es":"cita","example":"I have an appointment at ten."},{"en":"ID","es":"identificacion","example":"Please bring a valid ID."},{"en":"form","es":"formulario","example":"Fill out this form, please."},{"en":"sign here","es":"firme aqui","example":"Sign here at the bottom."},{"en":"documents","es":"documentos","example":"What documents do I need?"}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: vivienda', 'vocab',
  jsonb_build_object('goal', 'Vocabulario para alquilar y servicios.', 'words',
  '[{"en":"rent","es":"renta","example":"How much is the monthly rent?"},{"en":"deposit","es":"deposito","example":"Is there a security deposit?"},{"en":"lease","es":"contrato de arriendo","example":"The lease is for one year."},{"en":"utilities","es":"servicios","example":"Are utilities included?"},{"en":"landlord","es":"arrendador","example":"I will ask the landlord."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'migracion' and u.sort_order = 2;

-- ── COTIDIANO ──────────────────────────────────────────────
insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: dia a dia', 'vocab',
  jsonb_build_object('goal', 'Vocabulario cotidiano util.', 'words',
  '[{"en":"the bill","es":"la cuenta","example":"Can I have the bill, please?"},{"en":"menu","es":"menu","example":"Could I see the menu?"},{"en":"directions","es":"indicaciones","example":"Can you give me directions?"},{"en":"How much is it?","es":"Cuanto cuesta?","example":"How much is it in total?"},{"en":"around the corner","es":"a la vuelta","example":"It is just around the corner."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 1;

insert into lessons (unit_id, title, kind, content, sort_order)
select u.id, 'Vocabulario: viajes', 'vocab',
  jsonb_build_object('goal', 'Vocabulario para viajes e imprevistos.', 'words',
  '[{"en":"boarding pass","es":"pase de abordar","example":"Here is my boarding pass."},{"en":"delay","es":"retraso","example":"There is a delay on my flight."},{"en":"pharmacy","es":"farmacia","example":"Where is the nearest pharmacy?"},{"en":"Could you help me?","es":"Podria ayudarme?","example":"Excuse me, could you help me?"},{"en":"emergency","es":"emergencia","example":"This is an emergency."}]'::jsonb), 0
from units u join routes r on r.id = u.route_id
where r.slug = 'cotidiano' and u.sort_order = 2;
