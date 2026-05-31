// ════════════════════════════════════════════════════════════
// Edge Function · "Cerebro del tutor" (esqueleto del orquestador)
// Stream C · Fase 0
//
// Demuestra el patrón clave de seguridad: la API key vive en los
// secrets del servidor (Vault), NUNCA en el cliente ni en el bundle.
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// En producción aquí va el ruteo por nivel (1->2->3) y el fallback
// automático por fallo, presupuesto o saturación.
// ════════════════════════════════════════════════════════════

import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json({ error: "Falta ANTHROPIC_API_KEY en los secrets del servidor" }, 500);
  }

  const { message, level = "B1" } = await req.json().catch(() => ({}));
  if (!message) return json({ error: "Falta 'message'" }, 400);

  const system =
    `Eres un tutor de inglés cálido para un estudiante LATAM (nivel ${level}). ` +
    `El error nunca avergüenza: corrige con un recast suave ("Casi — se dice…"). ` +
    `Responde en inglés sencillo (apenas por encima de su nivel, i+1) y añade una ` +
    `breve guía en español solo si hace falta. Celebra el esfuerzo.`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const res = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: message }],
    });

    const reply = res.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { text: string }).text)
      .join("");

    return json({ reply, tier: 1, model: "claude-3-5-haiku-latest" });
  } catch (e) {
    // TODO Fase 1+: fallback automático Nivel 2 -> 3 aquí.
    return json({ error: String(e), tier: 1 }, 502);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
