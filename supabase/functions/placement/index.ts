// ════════════════════════════════════════════════════════════
// Edge Function · "Placement" (para conocerte) — estima nivel CEFR.
// Mismo fallback que tutor-brain: Claude (Nivel 1) -> Gemini (Nivel 2).
// Enmarcado con calma; nunca es un examen. Devuelve {level, rationale, canDo}.
// ════════════════════════════════════════════════════════════

import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

const SYSTEM =
  `Eres un evaluador CEFR calmado y alentador para un estudiante LATAM. ` +
  `Dada una MUESTRA en inglés del estudiante, estima su nivel CEFR ` +
  `(A1, A2, B1, B2, C1 o C2). Sé justo y generoso; nunca lo hagas sentir mal. ` +
  `Responde SOLO con JSON válido, sin texto adicional ni markdown:\n` +
  `{"level":"A2","rationale":"<una frase cálida en español>","canDo":"<'Ya puedes...' en español>"}`;

async function viaClaude(sample: string): Promise<string> {
  if (!ANTHROPIC_KEY) throw new Error("sin ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const res = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 300,
    system: SYSTEM,
    messages: [{ role: "user", content: `Muestra del estudiante:\n${sample}` }],
  });
  return res.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
}

async function viaGemini(sample: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("sin GEMINI_API_KEY");
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: SYSTEM + `\n\nMuestra del estudiante:\n${sample}` }] },
      ],
      generationConfig: { maxOutputTokens: 300, responseMimeType: "application/json" },
    }),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
}

function parseResult(text: string): { level: string; rationale: string; canDo: string } {
  let level = "A2";
  let rationale = "";
  let canDo = "";
  const m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const o = JSON.parse(m[0]);
      if (o.level) level = String(o.level).toUpperCase().trim();
      if (o.rationale) rationale = String(o.rationale);
      if (o.canDo) canDo = String(o.canDo);
    } catch {
      /* parse abajo */
    }
  }
  if (!/^(A1|A2|B1|B2|C1|C2)$/.test(level)) {
    const lm = text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
    level = lm ? lm[1].toUpperCase() : "A2";
  }
  if (!rationale) rationale = "Gracias por tu muestra. Empezamos desde aquí, a tu ritmo.";
  return { level, rationale, canDo };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const { sample } = await req.json().catch(() => ({}));
  if (!sample || String(sample).trim().length < 3) {
    return json({ error: "Muestra muy corta" }, 400);
  }

  const chain = [
    { provider: "anthropic", model: "claude-3-5-haiku-latest", tier: 1, run: () => viaClaude(sample) },
    { provider: "google", model: "gemini-2.5-flash", tier: 2, run: () => viaGemini(sample) },
  ];

  const errors: string[] = [];
  for (const step of chain) {
    try {
      const text = await step.run();
      const r = parseResult(text);
      return json({ ...r, provider: step.provider, model: step.model, tier: step.tier });
    } catch (e) {
      errors.push(`Nivel ${step.tier}: ${String(e)}`);
    }
  }
  return json({ error: "No se pudo evaluar", details: errors }, 502);
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
