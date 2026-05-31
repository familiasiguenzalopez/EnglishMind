**EnglishMind AI**  
Brief de Diseño \+ Capa Pedagógica · Prompt para Claude Designer

*v2.0 · Revisión pedagógica y de experiencia*

Identidad Visual · Sistema de Diseño · Filosofía de Aprendizaje · Tono · Accesibilidad · Diferenciación

**Academia de inglés con IA · El Salvador & LATAM**

# **Nota del especialista · qué cambió y por qué**

Tu documento original es excelente en lo que se propone: un brief de **identidad visual**. El anclaje LATAM, la persona del joven salvadoreño, las listas negras de tipografías y el formato exacto de tokens son decisiones maduras. Lo conservé casi todo.

**La observación central, desde la pedagogía:** una paleta sorpresa y una UI oscura premium ***no*** son lo que hará que el usuario se sienta cómodo, en confianza, libre, seguro, ni lo que hará que sienta que lo aprendido le sirve. Tampoco es lo que vence a Duolingo, ELSA o Speak. Eso lo decide la **experiencia de aprendizaje**: cómo se baja la ansiedad al hablar, cómo se corrige sin avergonzar, cómo se conecta cada lección con un objetivo real, y cómo el progreso se siente honesto.

Por eso la mejora principal es una **capa pedagógica que el diseño debe servir**. Lo nuevo va marcado en verde a lo largo del documento.

| Resumen de mejoras NUEVA Sección 00 — Filosofía de aprendizaje y las 5 promesas emocionales traducidas a requisitos de diseño concretos. Tutores con rol pedagógico, no solo cara: cada uno enseña algo distinto y útil. Onboarding que primero pregunta el porqué (motivación) y baja la ansiedad antes de cualquier prueba. Pantalla de voz rediseñada para el miedo a hablar: modo ensayo, reintentos sin penalización, modelo nativo lento. NUEVAS secciones: tono de voz y microcopy en español; gamificación sin patrones oscuros; accesibilidad y realidad del dispositivo; foso competitivo. Ajustes finos a color, componentes y feedback para que el error informe, no castigue. |
| :---- |

# **Intro · cómo usar este documento**

Este documento contiene el prompt completo para pegar en Claude (chat normal, no Claude Code) y generar el sistema de diseño visual de EnglishMind AI: paleta, tipografía, slogans, componentes y mockups, con todos los tokens CSS listos para Next.js. La **v2.0 añade además la dirección pedagógica y de experiencia** que esas decisiones visuales deben respetar.

## **Flujo de trabajo**

1. Copia los prompts de las secciones 00–08.

2. Pégalos en Claude y pide explícitamente un artefacto interactivo HTML/React de alta fidelidad.

3. Revisa e itera color, tipografía, copy y pantallas hasta que la identidad sea inconfundiblemente LATAM.

4. Exporta los CSS Variables a globals.css, el extend a tailwind.config.ts y las fuentes a layout.tsx.

| ⚠️  Importante Este prompt va dirigido a Claude en modo CHAT, no en Claude Code. Una vez aprobado el design system, incorporas los tokens al proyecto Next.js con el prompt DS-00 de Claude Code. |
| :---- |

# **00 · Filosofía de aprendizaje y promesa emocional  \[NUEVA\]**

El diseño visual es la piel; la pedagogía es el corazón. Esta sección define los principios que ***toda*** decisión de diseño debe servir: color, copy, componente y pantalla. Pégala en Claude **antes** de las demás, porque define el porqué de las otras.

## **Las 5 promesas → requisitos de diseño**

El usuario debe sentirse cómodo, en confianza, libre, seguro, y sentir que lo aprendido le sirve. Eso no se declara: se diseña. Traducción operativa:

| Promesa | Qué siente el usuario | Cómo se diseña |
| :---- | :---- | :---- |
| Cómodo | “No me siento tonto ni perdido.” | UI en español; una acción por pantalla; cero jerga; sesiones de 5–10 min; uso a una mano. |
| En confianza | “Puedo equivocarme sin vergüenza.” | Modo ensayo privado antes de “contar”; reintentos ilimitados sin penalización; el error es dato, no castigo; sin rojo agresivo. |
| Libre | “Aprendo a mi ritmo y a mi manera.” | Sin culpa por romper la racha; elige tu ruta y tu tutor; metas propias; modo offline para el transporte. |
| Seguro | “Mis datos y mi voz están protegidos.” | Privacidad clara; el audio no se comparte; control de micrófono siempre visible; certificado verificable y legítimo. |
| Útil | “Esto me sirve para mi trabajo y mi vida.” | Cada lección etiquetada con uso real (entrevista, call center, banco, migración); enunciados “Ya puedes…”; contenido LATAM. |

## **Principios de adquisición de segundo idioma (SLA) que rigen el producto**

* **Input comprensible (i+1):** contenido apenas por encima del nivel actual; nunca abrumar.

* **Filtro afectivo bajo:** la ansiedad bloquea el aprendizaje. Reducir el miedo a hablar es la prioridad nº 1 y el verdadero diferenciador emocional.

* **Producción con andamiaje:** hablar y escribir desde el día 1, con apoyos (frases modelo, repetición guiada) que se retiran poco a poco.

* **Repetición espaciada:** vocabulario y frases reaparecen en intervalos crecientes para fijar memoria de largo plazo.

* **Aprendizaje por tareas/escenarios:** se aprende haciendo algo real (“responde a tu supervisor”), no memorizando reglas sueltas.

* **Corrección con recast amable:** se modela la forma correcta sin avergonzar; feedback formativo, no una nota de examen.

* **Autonomía y metacognición:** el usuario ve su progreso real y entiende qué dominará después.

## **Anti-patrones · lo que NO haremos (y la competencia sí)**

* Culpa por racha rota: genera ansiedad, no aprendizaje. Nuestra racha celebra el regreso, no castiga la ausencia.

* Gamificación vacía: XP por minutos de pantalla en vez de por competencia demostrada.

* Feedback que avergüenza: un “Wrong\!” rojo y grande. Nosotros: “Casi — escucha la diferencia”.

* Inglés descontextualizado: frases que el usuario nunca usará. Nosotros: inglés con propósito y contexto LATAM.

* Lanzar a hablar sin red de seguridad: ignorar la vergüenza es el error nº 1 de las apps de conversación.

### **Prompt para pegar — Sección 00**

| SECCION 0 — FILOSOFIA DE APRENDIZAJE (rige todo el diseno) Esta app debe hacer que el usuario se sienta: comodo, en confianza, libre, seguro, y que sienta que lo aprendido le sirve. Traduce CADA decision visual a estos principios:   FILTRO AFECTIVO BAJO: reducir el miedo a hablar es la prioridad \#1.     \-\> Sin rojo agresivo. El error informa, no castiga.     \-\> Modo ensayo privado y reintentos sin penalizacion.   INPUT COMPRENSIBLE (i+1): nunca abrumar; un paso a la vez.   UTILIDAD VISIBLE: cada pantalla conecta con un objetivo real     (entrevista, call center, banco, migracion, certificado).   AUTONOMIA: el usuario elige ritmo, ruta y tutor; sin culpa.   CELEBRAR EL ESFUERZO, no solo el acierto. NO hagas: culpa por racha rota, XP por tiempo de pantalla, feedback que avergüenza, ingles descontextualizado. |
| :---- |

# **01 · Contexto del producto**

Texto a pegar en Claude:

| \# \=============================================================== \# BRIEF DE DISENO — EnglishMind AI \# Academia de Ingles con IA · El Salvador & LATAM \# \=============================================================== CONTEXTO DEL PRODUCTO EnglishMind AI es una academia digital de ingles con IA para El Salvador y Centroamerica. PWA mobile-first:   \-\> Tutores IA humanizados con voces latinoamericanas (ElevenLabs)   \-\> Analisis fonemico de pronunciacion en tiempo real (Azure Speech)   \-\> Correccion de escritura pedagogica con NLP (Claude \+ LanguageTool)   \-\> Gamificacion basada en progreso real medido (no tiempo de pantalla)   \-\> Certificados CEFR digitales con QR verificable   \-\> Curriculo contextualizado LATAM: remesas, call centers, migracion USUARIOS OBJETIVO   \-\> Jovenes 18-32 en El Salvador, Guatemala, Honduras, Nicaragua   \-\> Trabajadores que quieren ingles para call centers o trabajo remoto   \-\> Estudiantes que buscan certificacion CEFR para empleo o visas   \-\> Empresas que quieren certificar equipos (plan B2B) REALIDAD DE USO (importante para diseno)   \-\> Android de gama media/baja; datos limitados; uso en transporte,      casa o trabajo; entornos ruidosos; a menudo a una mano.   \-\> El ingles para ellos es movilidad social real: no es un juego,      es la diferencia entre un empleo y otro. |
| :---- |
| **Cambio v2.0** Se añadió el bloque “Realidad de uso”: gama baja, datos limitados, ruido y uso a una mano. Esto evita que Claude diseñe una UI bonita pero inviable en el dispositivo real del usuario. |

# **02 · Naming & Slogan**

| SECCION 2 — NAMING & SLOGAN Confirma o sugiere alternativas a 'EnglishMind AI' (profesional, memorable, aspiracional; funciona en ingles y espanol). Crea 3 slogans en ESPANOL para LATAM:   \-\> A — Emocional/aspiracional (marketing y redes)   \-\> B — Funcional/directo (App Store y onboarding)   \-\> C — B2B institucional (ventas a empresas y colegios) Cada uno: version ES \+ version EN \+ justificacion breve. Tono: aspiracion genuina ('tu ingles te abre puertas'), nunca corporativo frio. |
| :---- |

# **03 · Paleta de colores**

| SECCION 3 — PALETA DE COLORES COMPLETA Producto: PWA dark UI (fondo near-black). Necesito:   \-\> PRIMARIO: color marca. Inteligencia, confianza, energia LATAM.      NO azul corporativo generico.   \-\> SECUNDARIO: exito, pronunciacion correcta, XP ganado.   \-\> ACENTO: alerts, urgencia.   \-\> ADVERTENCIA: feedback intermedio (ni bien ni mal).   \-\> FONDOS DARK: 4 niveles (bg, surface, surface2, surface3).   \-\> TEXTOS: 3 niveles (bright, normal, muted).   \-\> BORDES: 2 niveles.   \-\> CEFR: 6 colores distintos A1..C2. REGLA PEDAGOGICA DE COLOR (importante):   \-\> El ERROR informa, no castiga. Evita rojo agresivo de alarma.      Para 'pronunciacion por mejorar' prefiere un coral/ambar calido,      reserva el rojo fuerte solo para errores criticos del sistema.   \-\> El EXITO debe sentirse generoso y celebratorio. TONO: joven salvadoreno de 22 anos que quiere trabajo en empresa americana. Que se sienta 'el futuro llego a Centroamerica': calido-digital, motivador, moderno. Quiero un color SORPRESA que nadie espere en EdTech. Referentes de tono: Linear, Raycast. Fuerza de marca: Spotify, Apple, Nike. NO Duolingo/Babbel/Coursera. |
| :---- |
| **Cambio v2.0** Se añadió la “regla pedagógica de color”: el rojo de alarma dispara el filtro afectivo. Un coral/ámbar cálido para “por mejorar” mantiene al usuario en confianza para reintentar. |

# **04 · Tipografía**

| SECCION 4 — TIPOGRAFIA (2 fuentes de Google Fonts)   \-\> DISPLAY: titulos, nombre app, metricas grandes, nivel CEFR.      Distintiva, con caracter, moderna pero no fria. Peso 700-800.      EVITAR: Inter, Roboto, Arial, Space Grotesk, Outfit.   \-\> BODY: texto, UI, botones, labels. Muy legible en pantallas      pequenas y a contraluz. Sin serifa. EVITAR: las anteriores. Para cada fuente: nombre \+ pesos \+ uso \+ scale tipografico   xs10 sm12 base14 md16 lg18 xl20 2xl24 3xl30 4xl36 \+ specimen renderizado. Asegura legibilidad en Android gama baja. |
| :---- |

# **05 · Iconografía, avatares y tutores**

**Cambio clave v2.0:** los 6 tutores dejan de ser solo caras. Cada uno tiene un **rol pedagógico** — así se sienten personajes con alma y, a la vez, son útiles: el usuario sabe a quién acudir para qué.

| Tutor | Rol pedagógico | Personalidad / acento |
| :---- | :---- | :---- |
| Valentina | Coach de principiantes: ritmo lento, mucho refuerzo positivo. | Cálida, paciencia infinita. Acento latino neutro. |
| Marcus | Especialista en pronunciación y fonética. | Directo pero alentador. Acento estadounidense claro. |
| Sofía | Conversación cotidiana y confianza para hablar. | Cercana, divertida. Baja la guardia del usuario. |
| James | Inglés de negocios, entrevistas y call center. | Profesional, estructurado. Acento formal. |
| Luna | Escritura y gramática: explica el porqué, sin regañar. | Analítica, amable con el error. |
| Miguel | Inglés para migración y vida en EE. UU. (trámites, comunidad). | Empático; “ha estado ahí”. |
| SECCION 5 — ICONOGRAFIA & ILUSTRACION   \-\> Estilo de iconos: outlined/filled/duotone/custom      (recomendar libreria React/Next.js).   \-\> 6 avatares de tutores con ROL PEDAGOGICO (ver tabla):      Valentina(principiantes), Marcus(pronunciacion), Sofia(conversacion),      James(negocios/entrevistas), Luna(escritura), Miguel(migracion).      Deben sentirse personajes reales con personalidad, no iconos.      El estilo visual debe reflejar su rol (ej. James mas formal).   \-\> Mascota de gamificacion que CELEBRA y acompana, nunca culpa      ni presiona. Aparece en racha, logros y XP. |  |  |

# **06 · Sistema de componentes UI**

| SECCION 6 — COMPONENTES (con los colores y fuentes elegidos)   \-\> Boton primario: normal \+ hover \+ disabled \+ loading   \-\> Boton secundario/outline   \-\> Input de texto: normal \+ focus \+ error (mensaje amable)   \-\> Badge CEFR A1..C2 (color distinto cada uno)   \-\> Score de pronunciacion: barra/circular verde/ambar/rojo      \+ microcopy: 'Casi, escucha la diferencia' (no 'Wrong')   \-\> Card de tutor: avatar \+ nombre \+ ROL \+ acento \+ 'Escuchar'   \-\> Streak counter: dias \+ llama, con opcion de 'congelar' racha   \-\> Tag/chip de categoria (ej. 'Entrevista', 'Call center')   \-\> Toggle 'Modo ensayo' (practica sin que cuente)   \-\> Estados vacios / offline / cargando con copy que tranquiliza |
| :---- |
| **Cambio v2.0** Se añadieron 3 componentes que materializan las promesas: el toggle “Modo ensayo” (confianza), la racha congelable (libertad sin culpa) y los estados vacíos/offline con copy tranquilizador (comodidad y seguridad). |

# **07 · Pantallas mockup (mobile 390 px)**

| SECCION 7 — PANTALLAS CLAVE PANTALLA 0 — Onboarding: '?Por que aprendes ingles?'  \[NUEVA\]   Opciones tappables: trabajo en call center / trabajo remoto /   entrevista / familia y migracion / certificado / superacion.   Copy que baja la ansiedad: 'No necesitas saber nada todavia.   Vamos a tu ritmo.' Luego un placement breve enmarcado como   'para conocerte', NUNCA como 'examen'. PANTALLA A — Seleccion de profesor   Grid 2x3 de tutores. Card: avatar \+ nombre \+ ROL \+ acento(bandera)   \+ especialidad \+ boton 'Escuchar'. Una card en estado activo. PANTALLA B — Home Dashboard   Header: badge CEFR \+ racha (llama) \+ XP bar.   Bienvenida del tutor activo (audio \+ texto).   Plan del dia: 4 actividades, cada una con su USO REAL etiquetado   y XP. Mini radar de 4 habilidades (Speaking/Writing/Reading/Listening).   Un enunciado 'Ya puedes...' que muestre competencia ganada. PANTALLA C — Sesion con tutor (modo voz)  \[REDISENADA\]   Avatar animado central. 2-3 burbujas con palabras coloreadas.   Boton PTT grande abajo. Timer en header.   ANSIEDAD AL HABLAR (clave):     \-\> Toggle 'Modo ensayo': practicar sin que cuente.     \-\> Escuchar el modelo nativo a velocidad normal y LENTA.     \-\> Reintentar sin penalizacion, boton siempre visible.     \-\> Mostrar transcripcion de lo que dijo el usuario \+ tip de        'como mejorar' (sonido/posicion), no solo color rojo.     \-\> Opcion de responder por TEXTO (transporte/trabajo ruidoso). |
| :---- |
| **Cambio v2.0** Pantalla 0 nueva: pregunta el porqué (motivación \= utilidad percibida) y baja la ansiedad antes de cualquier prueba. Pantalla C rediseñada en torno al miedo a hablar — la barrera nº 1 del usuario LATAM adulto. |

# **08 · Formato de entrega y tokens CSS**

Entrega TODO en un único artefacto HTML/React interactivo. El bloque de export debe poder copiarse a globals.css sin reescribir nada:

| SECCION 8 — FORMATO DE ENTREGA :root {   /\* Colors \*/   \--color-primary: \#...;   \--color-primary-dim: \#...;   \--color-secondary: \#...; \--color-accent: \#...; \--color-warning: \#...;   /\* Surfaces \*/   \--bg: \#...; \--surface: \#...; \--surface2: \#...; \--surface3: \#...;   /\* Text \*/  \--text-bright:\#...; \--text:\#...; \--text-muted:\#...;   /\* Borders \*/ \--border:\#...; \--border2:\#...;   /\* Feedback \*/   \--success:\#...;  /\* pronunciacion correcta \*/   \--warning:\#...;  /\* por mejorar (calido, no alarma) \*/   \--error:\#...;    /\* solo errores criticos \*/   /\* Typography \*/   \--font-display:'Fuente',sans-serif; \--font-body:'Fuente',sans-serif;   /\* Radius \*/ \--radius-sm/md/lg/xl \+ \--radius-full:9999px;   /\* CEFR \*/ \--cefr-a1..--cefr-c2: \#...; } Incluye tambien:   import { Fuente } from 'next/font/google'   tailwind.config.ts \-\> extend:{ colors:{...}, fontFamily:{...} } NO entregues texto plano: quiero un artefacto visual interactivo con colores reales, fuentes renderizadas, componentes en TODOS sus estados, y las pantallas mobile como screenshots reales. |
| :---- |

## **Dirección creativa**

**NO quiero:** 

* Azul/blanco genérico de apps educativas; gradientes arcoíris “startup 2019”.

* Tipografía Inter/Roboto/Arial; parecerse a ELSA, Duolingo o Speak.

**SÍ quiero:** 

* Identidad que grite “esto fue hecho para latinoamericanos”.

* Oscuro, moderno, con energía de app de gaming premium; un color sorpresa.

* Tutores con alma; un slogan de aspiración genuina.

* **Y que cada elemento respete la Sección 00:** calma, confianza, utilidad visible.

# **09 · Tono de voz y microcopy en español  \[NUEVA\]**

La marca también suena. El copy es donde el usuario siente (o no) la confianza. Reglas:

* **Cercano y de tú.** Cálido, motivador, salvadoreño/centroamericano natural, sin sonar a manual.

* **Celebra el esfuerzo.** “¡Lo intentaste, y eso ya cuenta\!” antes que solo premiar el acierto.

* **El error nunca avergüenza.** “Casi — vamos de nuevo”, “Escucha la diferencia”. Jamás “Incorrecto” o “Wrong”.

* **Bilingüe con intención.** UI en español; el inglés es el contenido a aprender. Nunca hacer sentir tonto al que no entiende.

* **Estados vacíos y de carga que tranquilizan.** “Sin internet ahora, pero tus lecciones descargadas siguen aquí.”

| Ejemplos de microcopy Error de pronunciación: “Casi lo tienes. El sonido /θ/ va con la lengua entre los dientes — escúchalo otra vez.” Racha rota: “¡Qué bueno verte de nuevo\! Seguimos justo donde lo dejaste.” Logro: “Sobreviviste tu primera llamada en inglés. Eso no es poca cosa.” |
| :---- |

### **Prompt para pegar — Sección 09**

| SECCION 9 — TONO DE VOZ (microcopy ES) Define el tono de voz de la marca y entrega 10-15 ejemplos de microcopy renderizados en la UI: bienvenida, error de pronunciacion, acierto, racha rota, logro, estado offline, estado vacio, boton de reintentar. Reglas: de tu, calido, celebra el esfuerzo, el error nunca avergüenza ('Casi' no 'Wrong'), UI en espanol. |
| :---- |

# **10 · Gamificación sin patrones oscuros  \[NUEVA\]**

Tu brief ya dice lo correcto (“progreso real, no tiempo de pantalla”). Esta sección lo blinda como diferenciador ético y de retención sana.

* **XP por competencia, no por minutos.** Se gana al pronunciar bien o completar una tarea real, no por estar en la app.

* **Racha que celebra el regreso.** Congelable y recuperable; los mensajes nunca culpan por faltar.

* **Logros ligados a can-do reales.** “Ya puedes presentarte en una entrevista”, no “100 lecciones”.

* **Sin notificaciones manipuladoras.** Recordatorios útiles y opcionales, nunca culpígenos.

| Por qué es un foso, no un detalle La gamificación culpígena retiene a corto plazo pero quema al usuario y daña la marca. Una progresión honesta y amable produce confianza, boca a boca y retención de largo plazo — justo lo que necesita un producto de movilidad social. |
| :---- |

# **11 · Accesibilidad y realidad del dispositivo  \[NUEVA\]**

El usuario real está en un Android de gama media/baja, con datos contados, en el bus o en el trabajo. La competencia global ignora esto; aquí está parte del foso.

* **Offline-first.** Descargar lecciones y voces de tutor para practicar sin datos.

* **Ligero.** Sin animaciones pesadas obligatorias; modo ahorro de datos y batería.

* **Subtítulos siempre.** Audio con texto; opción solo-texto; auriculares no obligatorios (entornos ruidosos).

* **Una mano.** Acciones principales al alcance del pulgar; botones grandes; PTT cómodo.

* **Legibilidad real.** Alto contraste, tamaños de fuente escalables, legible a contraluz.

### **Prompt para pegar — Sección 11**

| SECCION 11 — ACCESIBILIDAD & DISPOSITIVO Disena para Android gama media/baja con datos limitados: offline-first (lecciones y voces descargables), modo ahorro, subtitulos siempre, opcion solo-texto, uso a una mano, botones grandes, alto contraste, tipografia escalable. Demuestra estos estados en los mockups (offline, ahorro de datos, solo-texto). |
| :---- |

# **12 · El foso competitivo  \[NUEVA\]**

Para “superar a la competencia” conviene nombrarla y ubicar el hueco que EnglishMind ocupa. A grandes rasgos, por su posicionamiento conocido:

| Producto | Fortaleza | Hueco que deja |
| :---- | :---- | :---- |
| Duolingo | Hábito y diversión; muy masivo. | Conversación y pronunciación reales flojas; gamificación culpígena. |
| ELSA | Pronunciación con IA muy buena. | Poca conversación y currículo; sin contexto LATAM. |
| Speak | Conversación con IA fluida. | Tiende a ser caro y genérico-global; sin propósito de empleo local. |
| Cambly / Preply | Tutores humanos reales. | Caro y atado a horarios; no escala para el bolsillo del usuario. |

**El foso de EnglishMind \=** (contexto LATAM real) × (conversación con IA sin ansiedad) × (certificado CEFR con valor de empleo) × (precio accesible) × (filtro afectivo bajo por diseño). *Es difícil de copiar porque no es una feature: es producto \+ pedagogía \+ posicionamiento operando juntos.*

| Nota de honestidad Las fortalezas y huecos de la competencia describen su posicionamiento general conocido, no una comparación de funciones o precios actuales. Conviene validar lo concreto antes de usarlo en marketing. |
| :---- |

# **Después · qué hacer con el resultado**

5. **Pega el prompt en Claude (chat)** y pide explícitamente un artefacto interactivo. Si falta identidad LATAM, itera: “más oscuro, más latinoamericano, sorpréndeme con la paleta”.

6. **Revisa e itera** con cambios específicos: “el secundario se siente frío”, “quiero 2 alternativas de display”, “los avatares necesitan más alma”.

7. **Exporta los tokens** a globals.css, tailwind.config.ts y layout.tsx; actualiza nombres de fuentes en DS-00.

8. **Úsalos en los prompts M01–M12** de Claude Code, añadiendo al inicio fuentes, colores y “sigue las pantallas mockup como referencia exacta”.

| 📋  Workflow completo Sección 00 (pedagogía) guía el diseño → Claude Designer genera el Design System → exportas los tokens → los pegas en DS-00 → cada prompt M01–M12 usa esos tokens y esa filosofía → la app habla un solo idioma de principio a fin: bello, usable y que enseña de verdad. |
| :---- |

# **Add-on · prompt opcional para el logo (SVG)**

| LOGO MARK (SVG) — ADD-ON   \-\> HORIZONTAL: wordmark 'EnglishMind AI' con la display font.      Mark opcional (E estilizada, ondas de sonido, cerebro minimal,      o algo inesperado). Version dark (app) \+ light (certificados).   \-\> MARK cuadrado: favicon, icono PWA, push. Funciona en 16/32/192/512. Criterios: simple, memorable, latinoamericano en espiritu, usa la paleta definida. Entrega SVG inline: viewBox '0 0 200 60' horizontal, '0 0 60 60' mark. Vectores limpios sin fuentes embebidas. |
| :---- |

*— Fin del documento —*  
EnglishMind AI · Brand Identity, Design System & Pedagogía · v2.0 · Mayo 2026