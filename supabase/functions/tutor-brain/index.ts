// ════════════════════════════════════════════════════════════
// Edge Function · "Cerebro del tutor" con FALLBACK + role-play por escenario
// Stream C · Fase 1
//
// Nivel 1: Claude (Anthropic) · Nivel 2: Gemini (Google), con fallback 1->2.
// Acepta un "scenario" opcional: el tutor hace role-play (p. ej. cliente de
// call center) y da una pista al final si el estudiante no se entiende.
//
// Claves en los secrets del servidor (Vault), NUNCA en el cliente.
// ════════════════════════════════════════════════════════════

import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

function systemPrompt(level: string, scenario?: string): string {
  const base =
    `Eres un tutor de inglés cálido para un estudiante LATAM (nivel ${level}). ` +
    `El error nunca avergüenza: corrige con un recast suave ("Casi — se dice…"). ` +
    `Celebra el esfuerzo.`;
  if (scenario && scenario.trim()) {
    return (
      base +
      ` Estás haciendo un role-play y debes MANTENERTE EN PERSONAJE. Escenario: ${scenario}. ` +
      `Responde en 1-3 frases en inglés sencillo. Si el estudiante comete un error que ` +
      `dificulte entenderse, añade al final UNA sola línea de ayuda que empiece con "💡" (en español).`
    );
  }
  return (
    base +
    ` Responde en inglés sencillo (apenas por encima de su nivel, i+1) y añade ` +
    `una breve guía en español solo si hace falta.`
  );
}

async function viaClaude(
  message: string,
  level: string,
  scenario?: string,
): Promise<string> {
  if (!ANTHROPIC_KEY) throw new Error("sin ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const res = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 400,
    system: systemPrompt(level, scenario),
    messages: [{ role: "user", content: message }],
  });
  const text = res.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
  if (!text) throw new Error("Claude no devolvió texto");
  return text;
}

async function viaGemini(
  message: string,
  level: string,
  scenario?: string,
): Promise<string> {
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
          parts: [
            { text: systemPrompt(level, scenario) + "\n\nEstudiante dice: " + message },
          ],
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

  const { message, level = "B1", scenario } = await req
    .json()
    .catch(() => ({}));
  if (!message) return json({ error: "Falta 'message'" }, 400);

  const chain = [
    { provider: "anthropic", model: "claude-3-5-haiku-latest", tier: 1, run: () => viaClaude(message, level, scenario) },
    { provider: "google", model: "gemini-2.5-flash", tier: 2, run: () => viaGemini(message, level, scenario) },
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
