// ════════════════════════════════════════════════════════════
// Orquestador compartido (multi-turno). Lee orchestrator_config (service role
// → bypassa RLS) para la funcionalidad, arma la cadena (nivel activo primero +
// fallback) y llama al proveedor/modelo configurado con el HISTORIAL de la
// conversación. Normaliza proveedor/modelo (claude-*/gemini-* o descriptivo).
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

export type ChatMsg = { role: "user" | "assistant"; content: string };
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
  return "";
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
      /* fallback */
    }
  }
  return DEFAULT_CHAIN;
}

async function callClaude(model: string, system: string, messages: ChatMsg[]): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("sin ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey: key });
  const res = await anthropic.messages.create({
    model,
    max_tokens: 500,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  const t = res.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
  if (!t) throw new Error("Claude no devolvió texto");
  return t;
}

async function callGemini(model: string, system: string, messages: ChatMsg[]): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("sin GEMINI_API_KEY");
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } },
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

// Corre la cadena del orquestador con el historial. Lanza si todos fallan.
export async function runChat(
  feature: string,
  system: string,
  messages: ChatMsg[],
): Promise<ChatResult> {
  const chain = await getChain(feature);
  const errors: string[] = [];
  for (const step of chain) {
    try {
      const reply =
        step.provider === "anthropic"
          ? await callClaude(step.model, system, messages)
          : await callGemini(step.model, system, messages);
      return { reply, provider: step.provider, model: step.model, tier: step.tier, fellBack: errors.length > 0 };
    } catch (e) {
      errors.push(`${step.provider}/${step.model}: ${String(e)}`);
    }
  }
  throw new Error("Todos los niveles de IA fallaron: " + errors.join(" | "));
}
