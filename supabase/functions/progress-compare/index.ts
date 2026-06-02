// ════════════════════════════════════════════════════════════
// Edge Function · "Yo de antes" — compara dos grabaciones (antes vs ahora)
// con Gemini multimodal (audio). Devuelve una descripción cálida del avance.
// Regla: SIEMPRE "mira cuánto avanzaste", nunca burla del pasado.
// El audio se envía solo para este análisis; no se almacena.
// ════════════════════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

const PROMPT =
  `Eres un tutor de inglés cálido. Te doy DOS grabaciones del MISMO estudiante ` +
  `LATAM diciendo la misma frase: la primera es de ANTES, la segunda es de AHORA. ` +
  `En español, en 2-3 frases, describe QUÉ MEJORÓ entre las dos (fluidez, ` +
  `pronunciación de sonidos, vocabulario, confianza, ritmo). REGLA INNEGOCIABLE: ` +
  `enmárcalo siempre como "mira cuánto avanzaste"; NUNCA te burles del pasado. ` +
  `Si la diferencia es pequeña, anímalo igual y señala un detalle concreto a pulir. ` +
  `No transcribas literalmente; resume el progreso con cariño.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);
  if (!GEMINI_KEY) return json({ error: "Falta GEMINI_API_KEY en el servidor" }, 500);

  const { audioOld, audioNew } = await req.json().catch(() => ({}));
  if (!audioOld || !audioNew) return json({ error: "Faltan 'audioOld' / 'audioNew'" }, 400);

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT + "\n\nGrabación de ANTES:" },
          { inline_data: { mime_type: "audio/wav", data: audioOld } },
          { text: "Grabación de AHORA:" },
          { inline_data: { mime_type: "audio/wav", data: audioNew } },
        ],
      },
    ],
    generationConfig: { maxOutputTokens: 512, thinkingConfig: { thinkingBudget: 0 } },
  };

  let r: Response;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return json({ error: "No se pudo contactar Gemini: " + String(e) }, 502);
  }
  if (!r.ok) return json({ error: `Gemini HTTP ${r.status}: ${await r.text()}` }, 502);

  const data = await r.json();
  const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  return json({ analysis: text || "¡Se nota tu esfuerzo! Sigue grabándote y verás el avance." });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
