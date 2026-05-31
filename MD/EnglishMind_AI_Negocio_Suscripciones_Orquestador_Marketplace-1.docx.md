**EnglishMind AI**  
Módulo de Negocio — Suscripciones, Orquestador de IA y Marketplace

*Anexo al Prompt para Claude Designer v2.0 · Lote 2A*

Planes personales y para colegios · Tabla de modelos de IA en 3 niveles · Orquestador · Pagos LATAM

**El Salvador & LATAM · Mayo 2026**

# **Cómo usar este módulo**

Este anexo desarrolla la monetización de la app y la infraestructura de IA que la sustenta. Cubre cinco entregables: la estrategia de suscripciones, la interfaz de administrador para crearlas y parametrizarlas, las 7 propuestas de plan (4 personales \+ 3 para colegios), la tabla de modelos de IA en 3 niveles, el orquestador de modelos, y el marketplace con métodos de pago de El Salvador.

Acompaña a este documento una **interfaz interactiva (panel de administrador)** donde se ve funcionando el creador de suscripciones, el orquestador y el marketplace.

| ⚠️  Sobre precios y modelos Los precios de planes son propuestas iniciales a validar con tu mercado. Los costos de los modelos de IA son estimados de mayo 2026 y cambian por trimestre; el orquestador está diseñado precisamente para absorber esos cambios sin reescribir la app. |
| :---- |

# **1 · Estrategia de suscripciones**

**Principio rector:** monetizar sin traicionar la promesa de acceso. El usuario LATAM es sensible al precio; el inglés es movilidad social, no un lujo. El modelo es freemium honesto: un plan gratis genuinamente útil que engancha, y planes de pago accesibles que desbloquean potencia, no que rescatan al usuario de un producto mutilado.

* **Precios accesibles al mercado.** Referencia: la competencia premium ronda los $30/mes, fuera del alcance del usuario meta. EnglishMind se posiciona muy por debajo.

* **Descuento anual y por volumen.** El plan anual ahorra \~20%; los colegios escalan el precio por alumno a la baja según volumen.

* **Suscripción de regalo (remesa).** Un familiar en EE. UU. puede pagar el plan de un ser querido en El Salvador. Encaja con el contexto de remesas y es un canal de adquisición único.

* **Transparencia de cobro.** Sin renovaciones sorpresa, cancelación clara, aviso antes de cobrar el anual. Coherente con la promesa “seguro”.

* **Beca / tarifa social.** Descuento para estudiantes de bajos recursos u ONG: refuerza la misión y la marca.

# **2 · Interfaz para crear y parametrizar suscripciones**

Panel de administrador donde, sin tocar código, se crean planes y se define qué incluyen, su precio en US$ y sus descuentos. Campos a parametrizar por plan:

### **Identidad del plan**

* Nombre comercial, código interno, audiencia (personal / colegio), estado (borrador / activo / archivado), descripción y color de acento.

### **Precio y ciclo**

* Precio base en US$, ciclo (mensual / anual / por alumno-mes), precio anual con % de descuento, periodo de prueba (días), y precio promocional con vigencia.

* Descuentos especiales: código promocional, descuento por volumen (rangos de alumnos), beca/tarifa social, y modo regalo (remesa).

### **Funcionalidades incluidas (toggles y cupos)**

* Minutos de conversación de voz por día/mes; nivel de modelo de IA permitido (ver orquestador); mapa de pronunciación; corrección de escritura NLP; tutores disponibles; rutas de currículo; modo offline; repetición espaciada.

* Certificado CEFR (cuántos al año); Yo de antes; Yo Futuro (solo voz / con avatar de video); sesiones con especialista humano (cuántas/mes); créditos de marketplace; prioridad de soporte; sin publicidad.

### **Reglas**

* Límite de uso justo (fair-use) por funcionalidad, tope de costo de IA por usuario/mes (se conecta al orquestador), y comportamiento al excederlo (degradar a un nivel de modelo más barato, o pedir upgrade).

### **Prompt para pegar — Interfaz de suscripciones**

| PANTALLA ADMIN — CREADOR DE SUSCRIPCIONES Disena un panel donde el admin crea y edita planes sin codigo:   IDENTIDAD: nombre, codigo, audiencia(personal/colegio), estado,     descripcion, color de acento.   PRECIO: precio base US$, ciclo(mensual/anual/por alumno-mes),     % descuento anual, dias de prueba, precio promo \+ vigencia.   DESCUENTOS: codigo promo, rangos por volumen, beca/tarifa social,     modo regalo (remesa).   FUNCIONALIDADES (toggles \+ cupos): minutos de voz, NIVEL de modelo     IA permitido, mapa de pronunciacion, escritura NLP, tutores,     rutas, offline, repeticion espaciada, certificados CEFR/ano,     Yo de antes, Yo Futuro (voz/video), sesiones con humano,     creditos marketplace, prioridad soporte, sin anuncios.   REGLAS: fair-use por funcion, tope de costo IA/usuario/mes,     accion al excederlo (degradar nivel o pedir upgrade).   Vista previa en vivo de la card del plan \+ tabla comparativa. Guarda en estado/memoria; sin localStorage en el artefacto. |
| :---- |

# **3 · Planes personales (4 propuestas)**

Tabla comparativa. Precios indicativos en US$ a validar.

| Característica | Gratis | Básico | Pro | Premium |
| :---- | :---- | :---- | :---- | :---- |
| Precio mensual | $0 | $4.99 | $9.99 | $19.99 |
| Precio anual (equiv./mes) | $0 | $3.99 | $7.99 | $16.99 |
| Conversación de voz | 10 min/día | 60 min/día | Ilimitada\* | Ilimitada\* |
| Nivel de modelo IA | Nivel 2–3 | Nivel 1–2 | Nivel 1 | Nivel 1 |
| Mapa de pronunciación | Básico | Completo | Completo | Completo |
| Escritura NLP | Limitada | Completa | Completa | Completa |
| Tutores | 1 | Los 6 | Los 6 | Los 6 |
| Rutas de currículo | 1 | Todas | Todas | Todas |
| Modo offline | — | Sí | Sí | Sí |
| Certificado CEFR | — | 1/año | Ilimitados | Ilimitados |
| Yo de antes | Sí | Sí | Sí | Sí |
| Yo Futuro (voz) | — | — | Sí | Sí |
| Yo Futuro (avatar video) | — | — | — | Sí |
| Sesión con especialista humano | — | — | — | 1/mes |
| Créditos de marketplace | — | — | $5/mes | $15/mes |
| Soporte / anuncios | Estándar | Sin anuncios | Prioritario | Prioritario+ |

*\* Ilimitada con política de uso justo. El “Nivel de modelo IA” remite al orquestador (Secciones 5–6).*

| Posicionamiento Gratis — “Empieza”: engancha con valor real (10 min de voz/día, 1 tutor). Corre con modelos Nivel 2–3 para costo casi cero. Básico — “Constancia” ($4.99): el plan de hábito: práctica diaria seria, offline, 1 certificado al año. Pro — “Despega” ($9.99): conversación ilimitada, certificados, Yo Futuro en voz, créditos de marketplace. El plan estrella. Premium — “Tu Yo Pro” ($19.99): el avatar de video del Yo Futuro \+ 1 sesión humana al mes. Aspiracional, aún por debajo de la competencia. |
| :---- |

# **4 · Planes para colegios (3 propuestas)**

Precio por alumno-mes facturado anual. Incluyen la capa B2B (medir sin vigilar) del documento principal.

| Característica | Aula | Institución | Alianza |
| :---- | :---- | :---- | :---- |
| Precio (alumno-mes, anual) | $3.50 | $2.75 | $2.00 o personalizado |
| Mínimo de alumnos | 25 | 100 | 500+ |
| Panel de administrador | Sí | Sí | Avanzado |
| Docentes / managers | 1 | Hasta 10 | Ilimitados |
| Progreso por cohorte | Sí | Sí | Sí \+ analítica |
| Alta masiva CSV / SSO | CSV | CSV \+ SSO | CSV \+ SSO |
| Reportes exportables | Básicos | Completos | Completos \+ API |
| Certificados por lote | Sí | Sí | Sí |
| Branding del colegio | — | Ligero | Personalizado |
| Rutas de currículo a medida | — | 1 | Varias |
| Acompañamiento | Email | Dedicado | Dedicado \+ onboarding |
| Modelo de IA | Nivel 1–2 | Nivel 1 | Nivel 1 |
| **Descuentos para colegios** Volumen: el precio por alumno baja al subir de rango (25 → 100 → 500+). Anual con \~20% frente a mensual; opción de pago por ciclo escolar. Tarifa social para centros públicos u ONG; piloto pagado pequeño antes de expandir. |  |  |  |

# **5 · Tabla de modelos de IA en 3 niveles**

Cada funcionalidad que usa IA tiene tres niveles equivalentes en función y calidad: **Nivel 1** (de pago, el sugerido en el diseño), **Nivel 2** (free / tier con cuota), y **Nivel 3** (segundo nivel free \+ lanzamientos de prueba de pago). El orquestador (Sección 6\) permite cambiar de nivel por funcionalidad. Costos estimados de mayo 2026, a verificar.

### **5.1 · Conversación de voz en tiempo real**

**Cómo funciona:** Sesión de voz en vivo, interrumpible, con el tutor. Núcleo del “modo voz”.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | OpenAI GPT-Realtime-2 / mini, o Gemini Live (audio nativo) | \~$0.05–0.10/min (cacheado) | Pro, Premium |
| 2 | Gemini Live free tier / pipeline STT+LLM+TTS económico | Cuota free / bajo | Básico, Free |
| 3 | gpt-realtime-mini u open-source (Whisper+LLM+Cartesia) | Variable / muy bajo | Free, pruebas |

### **5.2 · Evaluación de pronunciación**

**Cómo funciona:** Puntúa precisión, fluidez, prosodia y completitud; alimenta el mapa de sonidos.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | Azure Speech Pronunciation Assessment \+ contenido vía modelo chat | \~$1/hora de audio | Todas |
| 2 | Azure free tier / análisis fonémico propio sobre Whisper | Cuota free | Free |
| 3 | Modelos open de pronunciación / nuevos de prueba | Bajo | Pruebas |

### **5.3 · Corrección de escritura (NLP)**

**Cómo funciona:** Doble pasada (LanguageTool \+ LLM) con feedback nivelado por CEFR.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | Claude (Sonnet/Opus) \+ LanguageTool | Bajo (texto) | Básico+ |
| 2 | Gemini Flash / GPT-mini (free-tier) \+ LanguageTool self-host | Cuota free / gratis | Free, Básico |
| 3 | Modelos open (DeepSeek/Llama) self-host / nuevos de prueba | Muy bajo | Pruebas |

### **5.4 · Cerebro del tutor \+ memoria (personalización)**

**Cómo funciona:** Decide qué practicar, recuerda errores y adapta la pedagogía (tutor agéntico).

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | Claude Opus/Sonnet o Gemini 3.1 Pro (contexto largo, memoria) | Bajo con prompt caching | Todas |
| 2 | Gemini 3.5 Flash / GPT-mini (free-tier) | Cuota free | Free, Básico |
| 3 | Gemini Flash-Lite / open models / nuevos de prueba | Muy bajo | Pruebas |

### **5.5 · Voz de los tutores (TTS) y voz clonada**

**Cómo funciona:** Voces latinas expresivas; la voz clonada habilita el Yo de antes / Yo Futuro.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | ElevenLabs (Expressive \+ voz clonada) | \~$0.08–0.12/min o por caracteres | Pro, Premium |
| 2 | OpenAI gpt-4o-mini-tts / Google TTS (free-tier) | Cuota free / bajo | Básico, Free |
| 3 | TTS open-source (Cartesia/Coqui) / nuevos de prueba | Muy bajo | Pruebas |

### **5.6 · Avatar de video (Yo Futuro Pro, tutores)**

**Cómo funciona:** Avatar con rostro y voz del usuario; lip-sync correcto por idioma.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | HeyGen LiveAvatar (en vivo) / Avatar IV (clips de hitos) | Alto (en vivo); medio (clips) | Premium; Pro (clips) |
| 2 | HeyGen Photo Avatar básico / D-ID | Medio-bajo | Premium |
| 3 | Lipsync open (Veo/Kling vía ImagineArt) / nuevos de prueba | Variable | Pruebas |

### **5.7 · Búsqueda / grounding (módulo de investigación)**

**Cómo funciona:** Agentes de investigación técnica y pedagógica con fuentes citadas.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | Claude con web search / Gemini 3.5 Flash (grounding) | \~$14/1000 queries tras cuota | Interno (admin) |
| 2 | Gemini free grounding (cuota mensual) / búsqueda básica | Cuota free | Interno |
| 3 | APIs de búsqueda económicas / nuevos de prueba | Bajo | Interno |

### **5.8 · Transcripción y subtítulos (STT)**

**Cómo funciona:** Subtítulos siempre (accesibilidad) y transcripción de lo que dice el usuario.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | GPT-Realtime-Whisper (streaming) / Azure STT | \~$0.017/min | Todas |
| 2 | Whisper self-host / Deepgram-AssemblyAI económicos | Gratis / muy bajo | Todas |
| 3 | Open-source / nuevos de prueba | Muy bajo | Pruebas |

### **5.9 · Ilustración (avatares estilizados, badges, mascota)**

**Cómo funciona:** Avatares no fotorrealistas (menores), insignias y arte de gamificación.

| Niv. | Proveedor · modelo | Costo estimado | Subs. |
| :---- | :---- | :---- | :---- |
| 1 | Modelo de imagen de gama alta (calidad de marca) | Por imagen | Assets |
| 2 | Generador de imagen free-tier | Cuota free | Interno |
| 3 | Open-source (SDXL/Flux) self-host / nuevos de prueba | Muy bajo | Interno |

# **6 · Orquestador de modelos de IA**

Panel donde el admin configura, por cada funcionalidad, los 3 niveles de modelo, y la app los invoca en ejecución para operar de la forma más eficiente.

## **Qué configura el admin por cada funcionalidad**

* **3 niveles:** Nivel 1 (de pago sugerido), Nivel 2 (free/tier) y Nivel 3 (segundo free \+ lanzamientos de prueba de pago).

* **Por nivel:** proveedor, modelo, API KEY (o equivalente para free/tier/prueba), endpoint, parámetros y estado (activo / en espera).

* **Nivel activo \+ fallback automático:** si el Nivel 1 falla, supera su presupuesto o está saturado, la app cae al Nivel 2 y luego al 3, sin interrumpir al usuario.

* **Asignación por suscripción:** qué nivel usa cada plan (ej. Free → Nivel 2–3; Pro/Premium → Nivel 1).

* **Tope de costo:** presupuesto por funcionalidad y por usuario/mes; al alcanzarlo, degrada de nivel o solicita upgrade.

* **Salud y pruebas:** verificación de la API key, latencia, tasa de error y botón “probar modelo”. Las claves se guardan cifradas, nunca en el cliente.

## **Cómo funciona en ejecución**

Al iniciar una tarea de IA, la app lee esta configuración, elige el nivel según el plan del usuario y el presupuesto disponible, llama al modelo activo y, si algo falla, aplica el fallback. Todo el ruteo es del lado del servidor; el cliente nunca ve las claves.

| Seguridad de claves Las API keys se almacenan cifradas en el servidor y se inyectan solo en las llamadas server-side. Nunca se exponen en el artefacto, el navegador ni el repositorio. Para modelos free cuya política usa datos para entrenar, márcalos como “solo no-sensible / pruebas”. |
| :---- |

### **Prompt para pegar — Orquestador**

| PANTALLA ADMIN — ORQUESTADOR DE MODELOS DE IA Lista de funcionalidades (voz, pronunciacion, escritura, cerebro del tutor, voz/TTS, avatar video, busqueda, STT, imagen). Por funcionalidad, 3 NIVELES configurables:   Nivel 1 (pago sugerido) · Nivel 2 (free/tier) · Nivel 3 (2do free   \+ lanzamientos de prueba de pago). Por nivel: proveedor, modelo, API KEY (o equivalente), endpoint,   parametros, estado (activo/espera). Controles: nivel activo \+ FALLBACK automatico (1-\>2-\>3 por fallo,   presupuesto o saturacion); asignacion de nivel por suscripcion;   tope de costo por funcion y por usuario/mes; salud (latencia,   errores) y boton 'probar modelo'. EJECUCION: la app lee la config, elige nivel por plan y presupuesto,   llama al modelo activo y aplica fallback. Ruteo SOLO server-side.   Claves CIFRADAS en servidor, nunca en cliente. Modelos free que   entrenan con datos \=\> marcar 'solo no-sensible/pruebas'. En el artefacto demo: usa estado en memoria, sin localStorage. |
| :---- |

# **7 · Marketplace dentro de la app**

Tienda interna donde el usuario activa, pagando, productos digitales y asesoría humana para acelerar, profundizar o ampliar su práctica.

## **Catálogo (ejemplos)**

* **Paquetes de contenido:** intensivo de entrevista, bootcamp de call center, inglés para migración, preparación de examen.

* **Potenciadores:** minutos extra de conversación, desbloqueo temporal de Nivel 1, más certificados, voz clonada premium.

* **Asesoría humana 1:1:** sesión con un especialista real (conversación, corrección, coaching de entrevista). Agenda y videollamada integradas.

* **Mentorías grupales y clubes de conversación;** regalos/becas para terceros (remesa).

## **Métodos de pago (El Salvador y región)**

El usuario activa con el medio que prefiera. Estado de mayo 2026:

| Método | Cómo y nota |
| :---- | :---- |
| Tarjeta (Visa/Mastercard) | Pasarela internacional (p. ej. Stripe). Cobro recurrente para suscripciones. |
| Transfer365 y Transfer365 QR (BCR) | Sistema interbancario instantáneo y sin costo del Banco Central de Reserva; QR nacional interoperable. Ideal para pago local. |
| “Pay” (BCR) | Nuevo sistema estatal interoperable sobre Transfer365, vía DUI, sin bitcoin; bancariza a quien no tiene cuenta. |
| Pagadito | Pasarela regional centroamericana; tarjetas y cuentas locales. |
| Chivo Wallet | Billetera estatal; paga en dólares o bitcoin. Adopción baja y bitcoin hoy de uso voluntario: ofrecer como opción, no como eje. |
| Bitcoin / Lightning | Vía procesador (OpenNode/IBEX) con conversión a US$ para evitar volatilidad. Opcional. |
| **Nota de realidad sobre bitcoin** En El Salvador el uso de bitcoin y de Chivo Wallet es hoy minoritario y su aceptación es voluntaria; el rail digital con tracción es Transfer365 / “Pay” del BCR. Incluye cripto como opción para quien la use, pero apóyate en tarjeta y Transfer365 como métodos principales, con conversión inmediata a US$ si aceptas bitcoin. |  |

## **Modelo y reglas**

* Comisión sobre la asesoría humana (marketplace de especialistas verificados); productos digitales con margen propio.

* Créditos de marketplace incluidos en Pro/Premium (ver Sección 3\) para impulsar el uso.

* Reembolsos claros, recibos, y para menores: las compras requieren cuenta de adulto o representante.

### **Prompt para pegar — Marketplace**

| PANTALLA — MARKETPLACE Tienda interna de: paquetes de contenido (entrevista, call center, migracion, examen), potenciadores (minutos extra, desbloqueo Nivel 1, certificados, voz premium) y ASESORIA HUMANA 1:1 (agenda \+ videollamada). Cada item: titulo, descripcion, beneficio, precio US$, boton 'Activar'. PAGOS: tarjeta (Visa/MC), Transfer365 y Transfer365 QR (BCR), 'Pay' (BCR), Pagadito, Chivo Wallet (US$/BTC), bitcoin/Lightning (con conversion a US$). Bitcoin/Chivo como OPCION (uso voluntario y minoritario); apoya en tarjeta y Transfer365 como principales. Reglas: creditos de marketplace de Pro/Premium aplicables; recibos y reembolsos claros; compras de menores via cuenta de representante. Diseno coherente con el design system (dark, calido-digital LATAM). |
| :---- |

*— Fin del módulo de negocio (Lote 2A) —*  
EnglishMind AI · Suscripciones, Orquestador de IA y Marketplace · Mayo 2026