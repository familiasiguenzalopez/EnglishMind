# Benchmark de competidores — apps de inglés (role-play y funciones)

> Investigación profunda (deep-research) realizada 2026-06-02 para EnglishMind AI.
> Método: 6 ángulos · 27 fuentes · 127 afirmaciones extraídas · 25 verificadas
> (23 confirmadas por voto 3-0 adversarial, 2 refutadas). Fuentes primarias =
> blogs de ingeniería y páginas oficiales de los vendedores + docs Azure/ELSA API
> + corroboración independiente (ZenML LLMOps, reseñas).

## Resumen ejecutivo

Las apps líderes (Duolingo Max / Video Call con Lily, Speak, ELSA, Loora, Busuu)
**convergen** en: role-play por escenarios de la vida real con personajes, flujo
**"conversa primero → feedback después"**, tutor IA con **memoria persistente**, y
voz cada vez más **speech-to-speech de baja latencia**. EnglishMind **ya tiene la
mayoría** de estas capacidades. Sus brechas principales son acotadas y varias se
cierran sin cambiar de proveedor.

## Hallazgos por dimensión (verificados)

### 1. Escenarios / role-play — patrón estándar, flujo conversa→feedback
- **Duolingo Max (Roleplay):** pedir café en París, comprar muebles con Eddy,
  planear vacaciones con Lin (sus personajes del "mundo Duolingo").
- **ELSA AI:** escenarios sugeridos **o "crea el tuyo"** describiendo el contexto;
  al terminar, la IA *se convierte en tutor* y da feedback detallado (flujo de 3
  pasos: elegir → conversar → feedback).
- **Speak (Live Roleplays)** y **Loora** (reuniones de negocios, entrevistas,
  charlas casuales).
- Fuentes: blog.duolingo.com/duolingo-max, elsaspeak.com/en/ai, loora.com,
  help.speak.com.
- **EnglishMind:** ✅ ya lo hace, con escenas visuales + personaje 2D + galería.

### 2. Ambientación visual / personaje — varía mucho (EnglishMind va por delante de varias)
- **Loora:** deliberadamente voz-first, **sin avatar, sin personaje, sin 3D, sin
  video** (UI minimalista, una sola voz). Confirmado por su landing + reseña
  independiente (icanlearn.com).
- **ELSA:** voz-céntrica, sin avatar 3D destacado.
- **Duolingo:** personajes 2D ilustrados, animados con **Rive** (motor 2D liviano).
- **EnglishMind:** ✅ personaje 2D animado + escenas = **diferenciador** frente a
  Loora/ELSA, NO una desventaja.

### 3. Memoria del tutor entre sesiones — 🔴 BRECHA #1 de EnglishMind
- **Duolingo Video Call (Lily):** extrae del transcript una **"List of Facts"** del
  usuario ("tienen dos perros, estudian arquitectura") y la **reinyecta en el system
  prompt** de la siguiente llamada → callbacks tipo "¿cómo están tus perros?".
  Mecanismo confirmado: facts extraídos por LLM inyectados al prompt (no vector DB,
  no fine-tuning), scope ~últimas 50 llamadas (ZenML LLMOps).
- También **adapta al nivel CEFR** inyectando explícitamente al LLM (p. ej. "You're
  talking to a learner who's at A2 CEFR level") y saludos por nivel.
- Fuentes: blog.duolingo.com/ai-and-video-call, zenml.io.
- **EnglishMind:** rastrea errores en el tiempo (hilo de aprendizaje) pero el tutor
  **no recuerda hechos personales** del alumno entre charlas.

### 4. Voz speech-to-speech de baja latencia — 🔴 brecha cara
- **Speak:** Live Roleplays sobre **OpenAI Realtime API (GPT-4o)**, responde "tan
  rápido o más que un humano" (~800 ms), procesa audio directo en un modelo, capta
  tono/prosodia más allá del texto. Soporta **hints** cuando el alumno se traba.
- ⚠️ **Matiz:** el propio Speak admite que speech-to-speech "aún no es bueno en
  coaching de pronunciación"; reseñas dicen "sin seguimiento acumulativo de errores
  recurrentes" → **el hilo de errores de EnglishMind es ventaja real, no paridad.**
- Fuentes: speak.com/blog/live-roleplays, openai.com, platform.openai.com.
- **EnglishMind:** usa Web Speech + Azure (turnos texto/lectura), no voz S2S ni
  manos libres.

### 5. Feedback de pronunciación — 🟡 a nivel fonema (EnglishMind lo cierra con lo que YA tiene)
- **ELSA:** 6 dimensiones (Overall, Pronunciation, Intonation, Fluency, Grammar,
  Vocabulary) + métricas (pitch/volume variation, pace, word stress) + feedback
  **por fonema** (IPA, animación de boca), con **ASR propio** entrenado en voz no
  nativa de 195 países.
- **Azure (¡ya integrado en EnglishMind!):** Accuracy/Fluency/Completeness/**Prosody**
  /PronScore, granularidad **fonema/sílaba/palabra (IPA)**, y soporta tanto lectura
  con texto de referencia como **habla espontánea sin referencia** (unscripted).
- Fuentes: elsaspeak.com/en/elsa-api, learn.microsoft.com (Azure Pronunciation
  Assessment, abr-2026).
- **EnglishMind:** hoy usa Azure solo como "lectura por palabra"; Azure **ya
  soporta fonema y habla libre** — capacidades sin explotar.

### 6. ASR (reconocimiento) — eje de diferenciación
- **ELSA y Speak** construyeron **ASR propio** entrenado en voz acentuada (Speak:
  Conformer sobre miles de horas, >60% reducción de WER vs sus modelos previos;
  ELSA rechazó la API de Google por inadecuada para diagnóstico fonético).
- **EnglishMind:** Azure/Web Speech es razonable para presupuesto LATAM, pero el
  reconocimiento de **acento salvadoreño/centroamericano** es riesgo de calidad y
  posible diferenciación si se afina (pregunta abierta).

### 7. SRS y seguimiento del progreso — 🟡 oportunidad
- **Busuu Smart Review:** SRS **adaptativo con ML** (fáciles → intervalos largos;
  difíciles → más frecuentes) y **compara L1↔L2** (tu idioma nativo vs el aprendido)
  para anticipar dificultades naturales; rastrea qué recuerdas y qué olvidas.
- Fuentes: busuu.com/en/languages/spaced-repetition, blog.busuu.com.
- **EnglishMind:** ✅ ya tiene SM-2 + hilo de errores. Oportunidad: (a) SRS
  adaptativo por ML en lugar de SM-2 fijo; (b) usar **español como L1** para
  anticipar false friends y pares mínimos.

### 8. Tecnología (LLM / TTS / avatares)
- **LLM:** familia **GPT-4/4o de OpenAI** domina la conversación (Duolingo y Speak).
  Duolingo separa "cerebro conversacional" (GPT-4) de "motor adaptativo de currículo"
  (su modelo propio *Birdbrain*).
- **TTS:** **Praktika** escala con **ElevenLabs**. Duolingo anima a Lily con **Rive**.
- **EnglishMind:** Claude→Gemini con fallback = válido y **más barato**. Lección:
  separar LLM-conversación de motor-de-currículo.

### 9. B2B / educación — 🟡 brecha + diferenciador
- **Busuu Business/Education:** Management Platform para docentes con **reportes
  individuales** (tiempo, lecciones) + **integración LMS/SSO** (API).
- Fuente: business.busuu.com/education.
- **EnglishMind:** reporte **agregado y anónimo ("medir sin vigilar")** —
  filosóficamente opuesto. Falta LMS/SSO; el ángulo anti-vigilancia es
  diferenciador de privacidad para colegios LATAM (comunicarlo deliberadamente).

## Tabla comparativa

| Capacidad | Duolingo | Speak | ELSA | Loora | Busuu | EnglishMind |
|---|---|---|---|---|---|---|
| Role-play escenarios | ✅ personajes | ✅ Live | ✅ +crear | ✅ | parcial | ✅ + galería |
| Personaje/escena visual | ✅ 2D (Rive) | ❌ voz | ❌ voz | ❌ voz | ❌ | ✅ 2D + escenas |
| Memoria tutor entre sesiones | ✅ Facts | ~ | ~ | ~ | — | ❌ brecha |
| Hints "¿qué digo?" | ~ | ✅ | ~ | ✅ | — | ✅ |
| Voz S2S baja latencia | ✅ | ✅ | ~ | ✅ | ❌ | ❌ brecha (cara) |
| Pronunciación por fonema | — | débil | ✅ | ~ | ~ | 🟡 Azure lo permite |
| Habla espontánea evaluada | — | ✅ | ✅ | ✅ | — | 🟡 Azure lo permite |
| Seguimiento errores recurrentes | ~ | ❌ | ~ | ~ | ✅ ML | ✅ hilo |
| SRS | Practice Hub | ❌ | ~ | — | ✅ ML+L1↔L2 | ✅ SM-2 fijo |
| CEFR / can-do | ✅ inyecta al LLM | ✅ | ✅ | ~ | ✅ | ✅ |
| Gamificación | ✅✅ ligas | ✅ | ✅ | ~ | ✅ | ✅ |
| B2B docentes | Schools | ✅ | ✅ | — | ✅✅ LMS/SSO | 🟡 anónimo, sin LMS |
| LLM | GPT-4/4o | OpenAI | propio+? | — | — | Claude→Gemini |

## Recomendaciones priorizadas (de la investigación)

**ALTA (bajo costo, alto impacto, dentro del stack):**
1. Memoria persistente del tutor (patrón Lily: extraer "List of Facts" y reinyectar).
2. Explotar Azure a nivel fonema + habla espontánea (sin cambiar proveedor).
3. Hints proactivos en vivo durante el role-play.

**MEDIA:**
4. SRS consciente del español (L1) — false friends, pares mínimos.
5. Inyectar CEFR explícito al LLM (saludos/dificultad por nivel).

**MEDIA-BAJA (depende de costo/conexión):**
6. Voz speech-to-speech / manos libres — solo si presupuesto/conexión lo permiten;
   mantener texto/turnos como default offline-tolerante, voz como upgrade.
7. B2B: integración LMS/SSO ligera manteniendo "medir sin vigilar".

**Diferenciación sostenible:** pedagogía "el error informa, no castiga" + hilo de
errores con aliento + B2B anónimo + PWA económica tolerante a conexión variable —
donde las líderes (modelos premium caros, dependencia de baja latencia, tracking
individual) están mal adaptadas a El Salvador/LATAM.

## Caveats (honestidad sobre el alcance)
- **Cobertura desigual:** evidencia rica en Duolingo, Speak, ELSA, Loora, Busuu.
  POBRE/ausente en claims verificados: **Babbel, Memrise, TalkPal, Praktika,
  Gliglish** — no tomar el informe como cobertura completa de estas.
- **Precios y free tier: NO cubiertos** (crítico para presupuesto LATAM) — pendiente.
- **Sesgo de fuente:** mayormente marketing de los vendedores (describe features, no
  valida eficacia). Superlativos de ELSA ("95%+", "195 países") no verificables.
- **Sensibilidad temporal:** Speak pudo migrar a `gpt-realtime` (ago-2025); lo
  descrito es de oct-2024. Azure verificado a abr-2026.
- **Refutado (no usar):** tier exacto de Duolingo Max; que la pronunciación B2B de
  Busuu sea por hablantes nativos (es **IA**).

## Preguntas abiertas (a investigar después, con foco)
1. Precios/free tier concretos de cada app y poder adquisitivo en El Salvador/LATAM.
2. Role-play/pronunciación/tech de Babbel, Memrise, TalkPal, Praktika, Gliglish.
3. Calidad del ASR (Azure/Web Speech) con acento salvadoreño/centroamericano.
4. Proveedores TTS/avatar (HeyGen/otros) y costo/latencia real de voz S2S en PWA LATAM.
5. Conciliar "medir sin vigilar" con la expectativa B2B de tracking individual + LMS.

## Fuentes principales
- Duolingo: blog.duolingo.com/duolingo-max, /ai-and-video-call; rive.app
- Speak: speak.com/blog/live-roleplays, /speak-gpt-4, /asr-levelup; openai.com
- ELSA: elsaspeak.com/en/ai, /elsa-api; api-external-doc.elsanow.co
- Loora: loora.com; icanlearn.com
- Busuu: busuu.com/en/languages/spaced-repetition; business.busuu.com/education
- Azure: learn.microsoft.com (Pronunciation Assessment)
- Praktika/ElevenLabs: elevenlabs.io/blog
