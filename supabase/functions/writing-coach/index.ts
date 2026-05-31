// ════════════════════════════════════════════════════════════
// Edge Function · "Coach de escritura" (NLP) · feature "escritura"
// Stream C · Fase 1
//
// Feedback enfocado: empieza por una fortaleza, UN solo punto a mejorar,
// NUNCA reescribe. Atiende errores de transferencia del español.
// Mismo fallback Nivel 1 (Claude) -> Nivel 2 (Gemini). Claves en secrets.
// ════════════════════════════════════════════════════════════

import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

function systemPrompt(level: string, genre: string): string {
  return (
    `Eres un profe de escritura en inglés, cálido y enfocado, para un estudiante ` +
    `LATAM (nivel ${level}). Género del texto: ${genre}. ` +
    `REGLAS: 1) Empieza por UNA fortaleza concreta. 2) Señala UN solo punto a ` +
    `mejorar (el más importante para comunicarse), con la forma correcta (recast) ` +
    `y el porqué en una línea. 3) NUNCA reescribas todo el texto por el estudiante. ` +
    `Atiende errores típicos del español: false friends (actually, assist, realize, ` +
    `embarrassed), sujeto omitido, orden de adjetivos, doble negación, preposiciones ` +
    `por calco (depend of, think in), incontables, make/do, y mayúsculas (días, meses, ` +
    `idiomas, nacionalidades). Explica el contraste con el español cuando ayude. ` +
    `Escribe el feedback en español; los ejemplos van en inglés. Sé breve y alentador. ` +
    `Formato exacto:\nFortaleza: ...\nOjo con esto: ...\nCómo se diría: ...`
  );
}

async function viaClaude(text: string, level: string, genre: string): Promise<string> {
  if (!ANTHROPIC_KEY) throw new Error("sin ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const res = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 500,
    system: systemPrompt(level, genre),
    messages: [{ role: "user", content: `Texto del estudiante:\n${text}` }],
  });
  const out = res.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
  if (!out) throw new Error("Claude no devolvió texto");
  return out;
}

async function viaGemini(text: string, level: string, genre: string): Promise<string> {
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
            { text: systemPrompt(level, genre) + "\n\nTexto del estudiante:\n" + text },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 500 },
    }),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const out: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!out) throw new Error("Gemini no devolvió texto");
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const { text, level = "A2", genre = "texto general" } = await req
    .json()
    .catch(() => ({}));
  if (!text || !String(text).trim()) return json({ error: "Falta 'text'" }, 400);

  const chain = [
    { provider: "anthropic", model: "claude-3-5-haiku-latest", tier: 1, run: () => viaClaude(text, level, genre) },
    { provider: "google", model: "gemini-2.5-flash", tier: 2, run: () => viaGemini(text, level, genre) },
  ];

  const errors: string[] = [];
  for (const step of chain) {
    try {
      const feedback = await step.run();
      return json({
        feedback,
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
