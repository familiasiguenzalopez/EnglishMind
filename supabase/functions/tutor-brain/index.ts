// ════════════════════════════════════════════════════════════
// Edge Function · "Cerebro del tutor" con FALLBACK de orquestador
// Stream C · Fase 0
//
// Nivel 1: Claude (Anthropic) · Nivel 2: Gemini (Google).
// Si el Nivel 1 falla (error, sin clave, saturación), cae automáticamente
// al Nivel 2 sin interrumpir al usuario. Devuelve qué nivel respondió.
//
// Las claves viven en los secrets del servidor (Vault), NUNCA en el cliente:
//   supabase secrets set ANTHROPIC_API_KEY=... GEMINI_API_KEY=...
// ════════════════════════════════════════════════════════════

import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

function systemPrompt(level: string): string {
  return (
    `Eres un tutor de inglés cálido para un estudiante LATAM (nivel ${level}). ` +
    `El error nunca avergüenza: corrige con un recast suave ("Casi — se dice…"). ` +
    `Responde en inglés sencillo (apenas por encima de su nivel, i+1) y añade ` +
    `una breve guía en español solo si hace falta. Celebra el esfuerzo.`
  );
}

// ── Nivel 1: Claude ────────────────────────────────────────
async function viaClaude(message: string, level: string): Promise<string> {
  if (!ANTHROPIC_KEY) throw new Error("sin ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const res = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 400,
    system: systemPrompt(level),
    messages: [{ role: "user", content: message }],
  });
  const text = res.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
  if (!text) throw new Error("Claude no devolvió texto");
  return text;
}

// ── Nivel 2: Gemini (REST, sin SDK) ────────────────────────
async function viaGemini(message: string, level: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("sin GEMINI_API_KEY");
  const model = "gemini-2.5-flash";
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt(level) + "\n\nEstudiante dice: " + message }],
        },
      ],
      generationConfig: { maxOutputTokens: 400 },
    }),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new Error("Gemini no devolvió texto");
  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const { message, level = "B1" } = await req.json().catch(() => ({}));
  if (!message) return json({ error: "Falta 'message'" }, 400);

  // Cadena de fallback del orquestador: Nivel 1 -> Nivel 2.
  const chain = [
    { provider: "anthropic", model: "claude-3-5-haiku-latest", tier: 1, run: () => viaClaude(message, level) },
    { provider: "google", model: "gemini-2.5-flash", tier: 2, run: () => viaGemini(message, level) },
  ];

  const errors: string[] = [];
  for (const step of chain) {
    try {
      const reply = await step.run();
      return json({
        reply,
        provider: step.provider,
        model: step.model,
        tier: step.tier,
        fellBack: errors.length > 0,
      });
    } catch (e) {
      errors.push(`Nivel ${step.tier} (${step.model}): ${String(e)}`);
    }
  }
  return json({ error: "Todos los niveles de IA fallaron", details: errors }, 502);
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
