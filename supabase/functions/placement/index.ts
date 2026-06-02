// ════════════════════════════════════════════════════════════
// Edge Function · "Placement" (para conocerte) · feature "cerebro"
// Usa el orquestador compartido. Estima nivel CEFR; nunca es un examen.
// Devuelve {level, rationale, canDo}.
// ════════════════════════════════════════════════════════════

import { CORS, json, runChat } from "../_shared/orchestrator.ts";

const SYSTEM =
  `Eres un evaluador CEFR calmado y alentador para un estudiante LATAM. ` +
  `Dada una MUESTRA en inglés del estudiante, estima su nivel CEFR ` +
  `(A1, A2, B1, B2, C1 o C2). Sé justo y generoso; nunca lo hagas sentir mal. ` +
  `Responde SOLO con JSON válido, sin texto adicional ni markdown:\n` +
  `{"level":"A2","rationale":"<una frase cálida en español>","canDo":"<'Ya puedes...' en español>"}`;

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

  try {
    const r = await runChat("cerebro", SYSTEM, `Muestra del estudiante:\n${sample}`);
    const parsed = parseResult(r.reply);
    return json({ ...parsed, provider: r.provider, model: r.model, tier: r.tier });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});
