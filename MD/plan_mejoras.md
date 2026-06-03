# Plan de mejoras EnglishMind AI — priorizado

> Creado 2026-06-02. Integra: (a) feedback de experiencia del usuario tras probar
> ELSA, Duolingo, Buddy y Loora; (b) hallazgos del benchmark (ver
> `benchmark_competidores.md`); (c) arreglos pendientes. Orden = prioridad.
> Leyenda esfuerzo: 🟢 bajo · 🟡 medio · 🔴 alto. Estado: ⬜ pendiente · 🔧 en curso · ✅ hecho.

## Norte del producto
Una experiencia **inmersiva, animada, bonita y profesional** (no un chat plano),
con pedagogía "el error informa, no castiga", para El Salvador/LATAM (PWA económica,
tolerante a conexión variable). Diferenciadores: personaje 2D animado + escenas,
hilo de errores con aliento, B2B "medir sin vigilar".

---

## P0 — Arreglos y claridad (rápidos, ahora)

### P0.1 — Corrección bilingüe: practicar/evaluar en inglés, CORREGIR en español citando el error  ✅ (en este lote)
- **Por qué:** lo pediste directo; baja el filtro afectivo y el alumno entiende QUÉ falló.
- **Cómo:** ajustar prompts de `tutor-brain` (💡), `convo-coach` (debrief "improve")
  y `writing-coach` para que la corrección sea en español y **cite**: "Dijiste/Escribiste
  «X» → mejor «Y»". 🟢
- **Estado:** implementado en este lote (redeploy de las 3 funciones).

### P0.2 — Pronunciación: Azure no devuelve puntajes (0/0/0)  🔧
- **Por qué:** lees y marca 0 en Precisión/Fluidez/Completitud (reconoce las palabras
  pero no las evalúa).
- **Cómo:** endurecer la Edge Function `pronunciation` (`format=detailed`, diagnóstico
  de la respuesta de Azure), y en la UI mostrar el texto reconocido + un mensaje claro
  cuando Azure no devuelva evaluación (en vez de "0"). Luego, con el diagnóstico, fix
  exacto (probable detalle de config/región del recurso Azure). 🟡
- **Estado:** hardening + diagnóstico en este lote; fix fino tras 1 prueba.

### P0.3 — Modal explicativo de certificación CEFR  ✅ (en este lote)
- **Por qué:** el certificado está, pero nadie sabe qué es ni cómo se obtiene.
- **Cómo:** botón "¿Qué es y cómo se obtiene?" en `/certificado` → modal con: qué es
  el EnglishMind Proficiency Statement, niveles A1–C2, cómo se mide (4 destrezas +
  can-do + placement), pasos para obtenerlo, y qué es / qué no es (no es examen oficial). 🟢
- **Estado:** implementado en este lote.

---

## P1 — Experiencia inmersiva y animada (tu visión — lo que más importa)

### P1.1 — Onboarding / creación de perfil tipo ELSA: animado, bonito, profesional  ⬜
- **Por qué:** es justo lo que esperabas; la primera impresión define todo. ELSA usa
  un mundo animado guiado; nosotros inventamos un equivalente con personalidad propia.
- **Cómo:** flujo guiado paso a paso con micro-animaciones y nuestra **mascota/personaje**
  que acompaña: (1) "¿por qué aprendes inglés?" (ya existe, embellecerlo), (2) elegir
  tutor + **acento/voz/tono** (ya existe, integrarlo al flujo animado), (3) elegir
  **avatar/look** (ya existe), (4) mini-placement amable, (5) "¡tu camino está listo!"
  con celebración. Transiciones, progreso visual, fondo ambientado por paso. 🟡
- **Reutiliza:** `SceneCharacter`, `TutorPrefs`, `AvatarPicker`, `onboarding`, `placement`.

### P1.2 — Personaje que HABLA con lip-sync (estilo Buddy/Loora, para adultos)  ⬜
- **Por qué:** Buddy engancha con avatares que hablan; Loora "te habla con avatar para
  practicar y te corrige". Queremos eso, profesional y para adultos.
- **Cómo (incremental, barato → premium):**
  - **v1 (🟢):** animar la boca del personaje 2D SVG en sincronía con el TTS (visemas
    simples por amplitud/sílabas) + gestos al celebrar/escuchar. Ya tenemos `em-talk`.
  - **v2 (🟡):** migrar el personaje a **Rive** (motor 2D liviano, el que usa Duolingo
    para Lily) → animaciones ricas, PWA-friendly, sin costo de servidor.
  - **v3 (🔴, gated):** avatar de video (HeyGen) o voz speech-to-speech — solo si
    presupuesto/conexión LATAM lo permiten.

### P1.3 — Pulido "Duolingo": divertido, ameno, con vida  ⬜
- **Por qué:** Duolingo es animado y ameno; nuestra UI aún se siente plana.
- **Cómo:** micro-interacciones, transiciones suaves entre pantallas, sonidos sutiles
  opcionales, animaciones de XP/racha/logros más expresivas, estados de carga con
  personalidad, celebración al completar unidad/nivel. 🟡
- **Reutiliza:** `Celebration`, `XpStreak`, keyframes `em-*`.

---

## P2 — Profundidad pedagógica (del benchmark)

### P2.1 — Memoria del tutor entre sesiones (brecha #1 vs líderes)  ⬜
- **Por qué:** Duolingo (Lily) recuerda al alumno y retoma ("¿cómo van tus perros?").
- **Cómo:** al cerrar una charla, el LLM extrae 2–4 "hechos" del alumno; se guardan
  (tabla nueva o en `profiles`) y se reinyectan en el system prompt la próxima vez.
  Barato, sin infraestructura nueva. 🟡 Conecta con `lib/learnlog`.

### P2.2 — Pronunciación a nivel fonema + habla espontánea (explotar Azure)  ⬜
- **Por qué:** ELSA evalúa por fonema; Azure (que ya tenemos) **ya lo soporta**.
- **Cómo:** usar `Granularity=Phoneme` (IPA) y evaluación sin texto de referencia
  (habla libre) dentro de la conversación, no solo lectura. 🟡 (Depende de P0.2.)

### P2.3 — Hints proactivos en vivo  ⬜
- **Por qué:** Speak ayuda "con la cantidad justa" cuando el alumno se traba.
- **Cómo:** detectar duda (silencio/"no sé") y ofrecer la sugerencia "¿qué digo?"
  proactivamente. 🟢 (Ya tenemos `askSuggest`.)

### P2.4 — SRS consciente del español (L1)  ⬜
- **Por qué:** Busuu compara L1↔L2 para anticipar dificultades.
- **Cómo:** sembrar/priorizar en el repaso los false friends y pares mínimos
  problemáticos para hispanohablantes; conectar con `soundmap` y `learnlog`. 🟡

### P2.5 — Inyectar CEFR explícito al LLM  ⬜
- **Cómo:** pasar el nivel y descriptores can-do al system prompt (saludos/dificultad
  por nivel, patrón Duolingo). 🟢 (Ya mandamos `level`/`tone`.)

---

## P3 — Negocio, escala y cierre

### P3.1 — Investigar precios/free tier de competidores + poder adquisitivo LATAM  ⬜
- Lo más crítico que faltó en el benchmark; define posicionamiento de precio. 🟢

### P3.2 — B2B: integración LMS/SSO ligera (manteniendo "medir sin vigilar")  ⬜ 🟡

### P3.3 — Auditoría de seguridad / RLS  ⬜
- Antes de abrir a usuarios reales: revisar 20 migraciones, 6 RPCs `SECURITY DEFINER`,
  RLS de todas las tablas, secretos. 🟡

### P3.4 — Gated (cuando decidas)  ⬜
- Voz speech-to-speech baja latencia; ElevenLabs TTS (Praktika lo usa); avatar de
  video (HeyGen); pagos reales. 🔴

---

## Orden sugerido de ejecución
1. **P0** completo (este lote: P0.1 + P0.3 ✅, P0.2 🔧).
2. **P1.2 v1** (boca animada con TTS) + **P1.3** (pulido) — alto impacto visible, bajo costo.
3. **P1.1** (onboarding animado tipo ELSA) — la "primera impresión".
4. **P2.1** (memoria del tutor) + **P2.2** (fonema) + **P2.3** (hints).
5. **P3.1** (precios) antes de cualquier decisión de monetización.
6. **P3.3** (seguridad) antes del lanzamiento.
