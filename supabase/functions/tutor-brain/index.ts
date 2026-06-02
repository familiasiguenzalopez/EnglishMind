// ════════════════════════════════════════════════════════════
// Edge Function · "Cerebro del tutor" · feature "cerebro"
// Usa el orquestador compartido: lee orchestrator_config (nivel activo +
// fallback) y llama al proveedor/modelo configurado. Role-play opcional.
// ════════════════════════════════════════════════════════════

import { CORS, json, runChat } from "../_shared/orchestrator.ts";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const { message, level = "B1", scenario } = await req.json().catch(() => ({}));
  if (!message) return json({ error: "Falta 'message'" }, 400);

  try {
    const r = await runChat("cerebro", systemPrompt(level, scenario), message);
    return json({
      reply: r.reply,
      provider: r.provider,
      model: r.model,
      tier: r.tier,
      fellBack: r.fellBack,
    });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});
