// ════════════════════════════════════════════════════════════
// Orquestador compartido para las Edge Functions de texto.
// Lee orchestrator_config (con la SERVICE ROLE key → bypassa RLS) para la
// funcionalidad pedida, arma la cadena (nivel ACTIVO primero, luego el resto
// como fallback) y llama al proveedor configurado. Si no hay config, usa un
// fallback por defecto. Normaliza proveedor/modelo: soporta valores canónicos
// (claude-*, gemini-*) o descriptivos del seed.
// ════════════════════════════════════════════════════════════

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

type Step = { provider: string; model: string; tier: number };

const DEFAULT_CHAIN: Step[] = [
  { provider: "google", model: "gemini-2.5-flash", tier: 2 },
  { provider: "anthropic", model: "claude-3-5-haiku-latest", tier: 1 },
];

function normProvider(provider: string, model: string): string {
  const p = (provider || "").toLowerCase();
  const m = (model || "").toLowerCase();
  if (m.startsWith("claude") || p.includes("anthropic") || p.includes("claude")) return "anthropic";
  if (m.startsWith("gemini") || p.includes("google") || p.includes("gemini")) return "google";
  return ""; // proveedor no soportado por una función de texto
}

function normModel(provider: string, model: string): string {
  const prov = normProvider(provider, model);
  const m = (model || "").trim();
  if (prov === "anthropic") return /^claude-/.test(m) ? m : "claude-3-5-haiku-latest";
  if (prov === "google") return /^gemini-/.test(m) ? m : "gemini-2.5-flash";
  return m;
}

async function getChain(feature: string): Promise<Step[]> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (url && key) {
    try {
      const sb = createClient(url, key);
      const { data } = await sb
        .from("orchestrator_config")
        .select("tier,provider,model,is_active")
        .eq("feature", feature)
        .order("is_active", { ascending: false })
        .order("tier", { ascending: true });
      if (data && data.length) {
        const steps = data
          .map((r: { tier: number; provider: string; model: string }) => ({
            provider: normProvider(r.provider, r.model),
            model: normModel(r.provider, r.model),
            tier: r.tier,
          }))
          .filter((s: Step) => s.provider !== "");
        if (steps.length) return steps;
      }
    } catch {
      /* usa el fallback */
    }
  }
  return DEFAULT_CHAIN;
}

async function callClaude(model: string, system: string, user: string): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("sin ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey: key });
  const res = await anthropic.messages.create({
    model,
    max_tokens: 500,
    system,
    messages: [{ role: "user", content: user }],
  });
  const t = res.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
  if (!t) throw new Error("Claude no devolvió texto");
  return t;
}

async function callGemini(model: string, system: string, user: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("sin GEMINI_API_KEY");
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: system + "\n\n" + user }] }],
      generationConfig: { maxOutputTokens: 500 },
    }),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const t: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!t) throw new Error("Gemini no devolvió texto");
  return t;
}

export type ChatResult = {
  reply: string;
  provider: string;
  model: string;
  tier: number;
  fellBack: boolean;
};

// Corre la cadena del orquestador para `feature`. Lanza si todos fallan.
export async function runChat(feature: string, system: string, user: string): Promise<ChatResult> {
  const chain = await getChain(feature);
  const errors: string[] = [];
  for (const step of chain) {
    try {
      const reply =
        step.provider === "anthropic"
          ? await callClaude(step.model, system, user)
          : await callGemini(step.model, system, user);
      return { reply, provider: step.provider, model: step.model, tier: step.tier, fellBack: errors.length > 0 };
    } catch (e) {
      errors.push(`${step.provider}/${step.model}: ${String(e)}`);
    }
  }
  throw new Error("Todos los niveles de IA fallaron: " + errors.join(" | "));
}
