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
    `por calco (depend of, think in), incontables, make/do, y mayúsculas. ` +
    `El feedback va en español; los ejemplos en inglés. Sé breve y alentador. ` +
    `Clasifica el punto a mejorar en UNA categoria fija: verb-tense, subject-verb, ` +
    `verb-form, articles, prepositions, plurals, word-order, word-choice, spelling, ` +
    `punctuation, politeness, naturalness, fluency, other. ` +
    `Responde SOLO JSON: {"feedback":"Fortaleza: ...\\nOjo con esto: ...\\nCómo se diría: ...","focus":[{"category":"<categoria>","note":"<que mejorar, breve>"}]}. ` +
    `Si el texto esta perfecto para su nivel, deja focus:[].`
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

  const { text, level = "A2", genre = "texto general" } = await req
    .json()
    .catch(() => ({}));
  if (!text || !String(text).trim()) return json({ error: "Falta 'text'" }, 400);

  try {
    const r = await runChat("escritura", systemPrompt(level, genre), [
      { role: "user" as const, content: `Texto del estudiante:\n${text}` },
    ]);
    const parsed = parseJson(r.reply);
    const feedback =
      parsed && typeof parsed.feedback === "string" && parsed.feedback.trim()
        ? parsed.feedback
        : r.reply;
    const focus =
      parsed && Array.isArray(parsed.focus)
        ? (parsed.focus as Array<{ category?: unknown; note?: unknown }>)
            .filter((f) => f && typeof f.category === "string")
            .slice(0, 2)
            .map((f) => ({ category: String(f.category), note: String(f.note ?? "") }))
        : [];
    return json({
      feedback,
      focus,
      provider: r.provider,
      model: r.model,
      tier: r.tier,
      fellBack: r.fellBack,
    });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});
