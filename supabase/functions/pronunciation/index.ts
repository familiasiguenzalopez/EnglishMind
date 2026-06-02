// ════════════════════════════════════════════════════════════
// Edge Function · Pronunciation Assessment (Azure Speech) — Nivel 1.
// Recibe audio WAV (base64, 16kHz mono PCM) + texto de referencia y
// devuelve scores (precisión, fluidez, completitud, pronunciación) y
// palabras con su puntaje. La AZURE_SPEECH_KEY vive en secrets del servidor.
// ════════════════════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const KEY = Deno.env.get("AZURE_SPEECH_KEY");
const REGION = Deno.env.get("AZURE_SPEECH_REGION");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);
  if (!KEY || !REGION) return json({ error: "Faltan AZURE_SPEECH_KEY / REGION en el servidor" }, 500);

  const { audio, reference } = await req.json().catch(() => ({}));
  if (!audio || !reference) return json({ error: "Faltan 'audio' o 'reference'" }, 400);

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
  } catch {
    return json({ error: "audio base64 inválido" }, 400);
  }

  const paConfig = btoa(
    JSON.stringify({
      ReferenceText: reference,
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true,
    }),
  );

  const url =
    `https://${REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

  let r: Response;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": paConfig,
        Accept: "application/json",
      },
      body: bytes,
    });
  } catch (e) {
    return json({ error: "No se pudo contactar Azure: " + String(e) }, 502);
  }

  if (!r.ok) return json({ error: `Azure HTTP ${r.status}: ${await r.text()}` }, 502);

  const data = await r.json();
  if (data?.RecognitionStatus && data.RecognitionStatus !== "Success") {
    return json({ error: "No se reconoció el audio", status: data.RecognitionStatus }, 200);
  }

  const nb = data?.NBest?.[0] ?? {};
  const pa = nb.PronunciationAssessment ?? {};
  const words = (nb.Words ?? []).map((w: any) => ({
    word: w.Word,
    accuracy: w.PronunciationAssessment?.AccuracyScore ?? null,
    error: w.PronunciationAssessment?.ErrorType ?? "None",
  }));

  return json({
    recognized: data?.DisplayText ?? "",
    pron: pa.PronScore ?? null,
    accuracy: pa.AccuracyScore ?? null,
    fluency: pa.FluencyScore ?? null,
    completeness: pa.CompletenessScore ?? null,
    words,
  });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
