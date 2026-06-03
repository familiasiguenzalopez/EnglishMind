// ════════════════════════════════════════════════════════════
// Edge Function · "Cerebro del tutor" · feature "cerebro"
// Multi-turno: recibe el historial de la conversación + el mensaje nuevo, así
// el tutor RECUERDA y mantiene el role-play. Usa el orquestador compartido.
// ════════════════════════════════════════════════════════════

import { CORS, json, runChat, type ChatMsg } from "../_shared/orchestrator.ts";

function systemPrompt(level: string, scenario?: string, starter?: string, tone?: string): string {
  const base =
    `Eres un tutor de inglés cálido para un estudiante LATAM (nivel ${level}). ` +
    (tone ? `Tu tono es ${tone.toLowerCase()}. ` : "") +
    `El error nunca avergüenza: corrige con un recast suave. Celebra el esfuerzo.`;
  if (scenario && scenario.trim()) {
    let s =
      base +
      ` ROLE-PLAY: tú eres el personaje del escenario (normalmente el cliente). ` +
      `Escenario: ${scenario}.`;
    if (starter && starter.trim()) {
      s += ` Ya abriste la conversación diciendo: "${starter}". Continúa desde ahí.`;
    }
    s +=
      ` REGLAS: habla SIEMPRE en inglés y MANTENTE EN PERSONAJE (responde en 1-3 ` +
      `frases como ese personaje, reaccionando a lo que dice el agente). NO expliques ` +
      `el ejercicio, NO narres la escena, NO cambies a español en tu diálogo. Si el ` +
      `estudiante comete un error de inglés, añade al final UNA línea que empiece con ` +
      `"💡" EN ESPAÑOL, citando lo que dijo y la forma correcta, con este formato: ` +
      `💡 Dijiste "X", mejor "Y". Si no hubo error, no agregues la línea.`;
    return s;
  }
  return (
    base +
    ` Responde en inglés sencillo (apenas por encima de su nivel, i+1). Si el ` +
    `estudiante comete un error de inglés, añade al final UNA línea que empiece con ` +
    `"💡" EN ESPAÑOL citando lo que dijo y la forma correcta: 💡 Dijiste "X", mejor "Y".`
  );
}

function sanitizeHistory(h: unknown): ChatMsg[] {
  if (!Array.isArray(h)) return [];
  const out = h
    .filter(
      (m): m is ChatMsg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-10); // últimos 10 turnos (acota tokens)
  // El historial debe terminar en 'assistant' para alternar bien al añadir el user
  while (out.length && out[out.length - 1].role === "user") out.pop();
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const { message, level = "B1", scenario, starter, tone, history } = await req
    .json()
    .catch(() => ({}));
  if (!message) return json({ error: "Falta 'message'" }, 400);

  const messages: ChatMsg[] = [
    ...sanitizeHistory(history),
    { role: "user", content: String(message) },
  ];

  try {
    const r = await runChat("cerebro", systemPrompt(level, scenario, starter, tone), messages);
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
