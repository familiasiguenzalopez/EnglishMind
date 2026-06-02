// ════════════════════════════════════════════════════════════
// Edge Function · "Coach de conversación" — utilidades de la práctica:
//  · mode "suggest": 3 frases cortas que el estudiante podría decir ahora.
//  · mode "debrief": cierre motivador (qué hizo bien, qué pulir, frases, can-do).
// Usa Gemini (JSON). El estudiante es quien responde al personaje del escenario.
// ════════════════════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

type Msg = { role: "user" | "assistant"; content: string };

function transcript(history: Msg[]): string {
  return (Array.isArray(history) ? history : [])
    .slice(-12)
    .map((m) => `${m.role === "assistant" ? "Tutor/Personaje" : "Estudiante"}: ${m.content}`)
    .join("\n");
}

function prompt(
  mode: string,
  scenario: string,
  goal: string,
  level: string,
  hist: string,
): string {
  const ctx = `Escenario: ${scenario || "conversación general"}. Objetivo: ${goal || "practicar inglés"}. Nivel del estudiante: ${level}. Conversación hasta ahora:\n${hist || "(aún no empieza)"}`;
  if (mode === "debrief") {
    return (
      `Eres un tutor de inglés cálido para un estudiante LATAM. ${ctx}\n\n` +
      `Escribe un cierre MOTIVADOR en español. Celebra el esfuerzo; nunca avergüences. ` +
      `Responde SOLO JSON: {"wins":"<1-2 frases de lo que hizo bien>","improve":"<UNA cosa a mejorar, con un ejemplo breve en inglés>","phrases":["<frase util en ingles que uso o podria usar>","<otra>"],"canDo":"<frase 'Ya puedes...' acorde al objetivo>"}`
    );
  }
  return (
    `Eres un coach de inglés. ${ctx}\n\n` +
    `El estudiante debe responder al personaje. Sugiere 3 frases CORTAS y naturales en inglés ` +
    `(nivel ${level}) que el estudiante podría decir AHORA como su próxima intervención. ` +
    `Responde SOLO JSON: {"suggestions":["...","...","..."]}`
  );
}

function parseJson(text: string): Record<string, unknown> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {
      /* */
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);
  if (!GEMINI_KEY) return json({ error: "Falta GEMINI_API_KEY" }, 500);

  const { mode = "suggest", scenario = "", goal = "", level = "A2", history = [] } =
    await req.json().catch(() => ({}));

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt(mode, scenario, goal, level, transcript(history)) }] }],
      generationConfig: { maxOutputTokens: 512, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  if (!r.ok) return json({ error: `Gemini HTTP ${r.status}: ${await r.text()}` }, 502);
  const data = await r.json();
  const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  const parsed = parseJson(text) ?? {};

  if (mode === "debrief") {
    return json({
      wins: String(parsed.wins ?? "¡Te animaste a conversar en inglés, y eso ya cuenta!"),
      improve: String(parsed.improve ?? "Sigue practicando frases completas."),
      phrases: Array.isArray(parsed.phrases) ? parsed.phrases.slice(0, 4) : [],
      canDo: String(parsed.canDo ?? "Ya puedes sostener una práctica en inglés."),
    });
  }
  const s = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [];
  return json({ suggestions: s });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
