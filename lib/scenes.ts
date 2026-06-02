// ════════════════════════════════════════════════════════════
// Catálogo de ESCENAS (ambientación visual + contenido de role-play).
// Puro: seguro para importar en server y client. Sin APIs de navegador.
//  · "ring"  → color de acento de la escena (halo, anillos, badges).
//  · "bg"    → degradado [arriba, abajo] del fondo ambientado.
//  · "motifs"→ emojis flotantes de ambiente.
//  · scenario "" ⇒ charla libre (sin role-play).
// ════════════════════════════════════════════════════════════

export type Scene = {
  id: string;
  name: string; // dónde transcurre (chip)
  who: string; // quién te habla
  emoji: string; // ícono del lugar/rol
  ring: string; // color de acento
  bg: [string, string]; // degradado del fondo
  motifs: string[]; // emojis de ambiente
  blurb: string; // descripción corta (galería)
  goal: string; // objetivo pedagógico (ES)
  scenario: string; // prompt de role-play para el tutor ("" = charla libre)
  starter: string; // primera línea del personaje (EN)
  level: string; // CEFR sugerido
};

const SCENE_MAP: Record<string, Scene> = {
  tutor: {
    id: "tutor",
    name: "Charla libre",
    who: "Tu tutor",
    emoji: "🗣️",
    ring: "#27e0c4",
    bg: ["#15323a", "#101820"],
    motifs: ["💬", "✨", "📚"],
    blurb: "Conversa sin guion y suéltate.",
    goal: "Conversa libremente y gana confianza hablando inglés.",
    scenario: "",
    starter: "Hi! Great to see you. What would you like to talk about today?",
    level: "A2",
  },
  cafe: {
    id: "cafe",
    name: "Cafetería",
    who: "Barista",
    emoji: "☕",
    ring: "#f5b544",
    bg: ["#3a2a18", "#14181d"],
    motifs: ["☕", "🥐", "🎶"],
    blurb: "Pide tu café y haz small talk.",
    goal: "Pide tu bebida y conversa brevemente con el barista.",
    scenario:
      "You are a friendly barista at a busy US coffee shop. Greet the customer, take their order, ask a small-talk question, and tell them the total.",
    starter: "Hi there! What can I get started for you today?",
    level: "A2",
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurante",
    who: "Mesero",
    emoji: "🍽️",
    ring: "#ff6b3d",
    bg: ["#3a1820", "#14181d"],
    motifs: ["🍽️", "🍷", "🕯️"],
    blurb: "Ordena del menú y pregunta algo.",
    goal: "Ordena tu comida y haz una pregunta sobre el menú.",
    scenario:
      "You are a waiter at a casual US restaurant. Greet the student, take their order, and answer one menu question.",
    starter: "Hi, welcome! Can I start you off with something to drink?",
    level: "A2",
  },
  airport: {
    id: "airport",
    name: "Aeropuerto",
    who: "Agente de check-in",
    emoji: "✈️",
    ring: "#22d3ee",
    bg: ["#13314a", "#101820"],
    motifs: ["✈️", "🧳", "🛂"],
    blurb: "Haz el check-in de tu vuelo.",
    goal: "Haz el check-in: pasaporte, destino y equipaje.",
    scenario:
      "You are an airline check-in agent. Greet the traveler, ask for their passport and destination, and ask whether they are checking any bags.",
    starter: "Good morning! May I see your passport, please?",
    level: "A2",
  },
  hotel: {
    id: "hotel",
    name: "Hotel",
    who: "Recepcionista",
    emoji: "🛎️",
    ring: "#27e0c4",
    bg: ["#163a38", "#101820"],
    motifs: ["🛎️", "🛏️", "🗝️"],
    blurb: "Haz tu check-in en recepción.",
    goal: "Haz el check-in y pregunta por un servicio del hotel.",
    scenario:
      "You are a hotel front-desk receptionist. Greet the guest, find their reservation, and explain breakfast hours.",
    starter: "Welcome to the Grand Hotel! Do you have a reservation with us?",
    level: "A2",
  },
  shopping: {
    id: "shopping",
    name: "De compras",
    who: "Dependiente",
    emoji: "🛍️",
    ring: "#f472b6",
    bg: ["#3a1830", "#14181d"],
    motifs: ["🛍️", "👕", "💳"],
    blurb: "Pide una talla y paga.",
    goal: "Pide ayuda con una talla y completa el pago.",
    scenario:
      "You are a clothing store clerk. Help the customer find their size, suggest one option, and handle the payment.",
    starter: "Hi! Let me know if you need help finding your size.",
    level: "A2",
  },
  directions: {
    id: "directions",
    name: "En la calle",
    who: "Un local amable",
    emoji: "🧭",
    ring: "#fb923c",
    bg: ["#3a2a14", "#14181d"],
    motifs: ["🧭", "🚶", "🗺️"],
    blurb: "Pide indicaciones y confírmalas.",
    goal: "Pregunta cómo llegar a un lugar y confirma la ruta.",
    scenario:
      "You are a friendly local. The student asks for directions to a train station; give simple, short directions.",
    starter: "You look a little lost — do you need help finding something?",
    level: "A2",
  },
  interview: {
    id: "interview",
    name: "Entrevista",
    who: "Reclutador/a",
    emoji: "💼",
    ring: "#9b6bff",
    bg: ["#241a3a", "#101820"],
    motifs: ["💼", "📄", "🤝"],
    blurb: "Responde a un reclutador con seguridad.",
    goal: "Preséntate y responde preguntas típicas de entrevista.",
    scenario:
      "You are a friendly hiring manager interviewing the student for a customer support role. Ask them to tell you about themselves and follow up on their answer.",
    starter: "Thanks for coming in today. So, tell me a little about yourself.",
    level: "B1",
  },
  office: {
    id: "office",
    name: "Oficina remota",
    who: "Tu compañero/a",
    emoji: "💻",
    ring: "#818cf8",
    bg: ["#1b2440", "#101820"],
    motifs: ["💻", "📊", "☕"],
    blurb: "Da tu update en el daily.",
    goal: "Da tu update: ayer, hoy y bloqueos.",
    scenario:
      "You are a teammate hosting a remote daily stand-up. Greet the student, ask for their update, and react briefly.",
    starter: "Morning! Want to kick us off? What did you work on yesterday?",
    level: "B1",
  },
  clerk: {
    id: "clerk",
    name: "Oficina de trámites",
    who: "Funcionario/a",
    emoji: "🗂️",
    ring: "#22d3ee",
    bg: ["#16323a", "#101820"],
    motifs: ["🗂️", "🪪", "🖊️"],
    blurb: "Explica tu trámite y da tus datos.",
    goal: "Explica por qué vienes y proporciona tus datos.",
    scenario:
      "You are a front-desk clerk at a government office. Greet the student, ask why they are here, and ask for an ID.",
    starter: "Good morning. How can I help you today?",
    level: "A2",
  },
  doctor: {
    id: "doctor",
    name: "Consultorio",
    who: "Enfermero/a",
    emoji: "🩺",
    ring: "#34d399",
    bg: ["#143a2a", "#101820"],
    motifs: ["🩺", "💊", "🩹"],
    blurb: "Describe un síntoma y entiende indicaciones.",
    goal: "Describe un síntoma simple y entiende las instrucciones.",
    scenario:
      "You are a nurse at a clinic. Ask the student what brings them in today and respond with simple instructions.",
    starter: "Hello, what brings you in today?",
    level: "A2",
  },
  "call-center": {
    id: "call-center",
    name: "Call center",
    who: "Cliente",
    emoji: "🎧",
    ring: "#818cf8",
    bg: ["#1c2440", "#101820"],
    motifs: ["🎧", "📞", "💬"],
    blurb: "Atiende una llamada de soporte.",
    goal: "Saluda, identifícate y ayuda a un cliente por teléfono.",
    scenario:
      "You are a friendly customer who just called a US company support line. Wait for the agent to greet you, then say your internet has been very slow today.",
    starter: "Hi, is anyone there? My internet has been really slow today.",
    level: "A2",
  },
};

// Orden de la galería (cards que se pueden practicar directo).
const GALLERY_IDS = [
  "tutor",
  "cafe",
  "restaurant",
  "airport",
  "hotel",
  "shopping",
  "directions",
  "interview",
  "office",
  "clerk",
  "doctor",
  "call-center",
];

export const GALLERY: Scene[] = GALLERY_IDS.map((id) => SCENE_MAP[id]);

export function getScene(id?: string): Scene | undefined {
  return id ? SCENE_MAP[id] : undefined;
}

// Elige la ambientación de una lección de ruta (DB) por su contenido:
// usa content.scene si viene; si no, infiere por palabras clave del escenario.
export function sceneForLesson(
  content?: { scene?: string; scenario?: string } | null,
): Scene {
  if (content?.scene && SCENE_MAP[content.scene]) return SCENE_MAP[content.scene];
  const s = (content?.scenario || "").toLowerCase();
  const has = (...k: string[]) => k.some((x) => s.includes(x));
  if (has("support line", "internet", "bill", "router", "service has been down", "charged twice", "charge on")) return SCENE_MAP["call-center"];
  if (has("hiring manager", "interview", "interviewer", "salary", "compensation", "strength")) return SCENE_MAP["interview"];
  if (has("nurse", "clinic", "brings you in", "pharmacist", "pharmacy", "symptom")) return SCENE_MAP["doctor"];
  if (has("waiter", "restaurant", "menu", "drink")) return SCENE_MAP["restaurant"];
  if (has("barista", "coffee")) return SCENE_MAP["cafe"];
  if (has("directions", "lost", "train station")) return SCENE_MAP["directions"];
  if (has("stand-up", "teammate", "blocker", "blocked", "remote", "video meeting", "feedback")) return SCENE_MAP["office"];
  if (has("government office", "front-desk clerk", "school", "secretary", "enroll", "register", "bank teller", "landlord", "apartment", "rent", "deposit", "checking account")) return SCENE_MAP["clerk"];
  if (has("check-in", "reservation", "hotel", "guest")) return SCENE_MAP["hotel"];
  if (has("passport", "airline", "traveler", "luggage")) return SCENE_MAP["airport"];
  return SCENE_MAP["tutor"];
}
