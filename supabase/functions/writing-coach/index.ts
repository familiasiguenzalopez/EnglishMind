// ════════════════════════════════════════════════════════════
// Edge Function · "Coach de escritura" (NLP) · feature "escritura"
// Usa el orquestador compartido (nivel activo + fallback desde la config).
// Feedback enfocado: una fortaleza, UN punto a mejorar, NUNCA reescribe.
// ════════════════════════════════════════════════════════════

import { CORS, json, runChat } from "../_shared/orchestrator.ts";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const { text, level = "A2", genre = "texto general" } = await req
    .json()
    .catch(() => ({}));
  if (!text || !String(text).trim()) return json({ error: "Falta 'text'" }, 400);

  try {
    const r = await runChat("escritura", systemPrompt(level, genre), [
      { role: "user" as const, content: `Texto del estudiante:\n${text}` },
    ]);
    return json({
      feedback: r.reply,
      provider: r.provider,
      model: r.model,
      tier: r.tier,
      fellBack: r.fellBack,
    });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});
