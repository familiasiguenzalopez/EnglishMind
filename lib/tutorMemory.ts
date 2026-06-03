// Memoria del tutor (patrón Lily). Datos durables y NO sensibles del alumno que
// el tutor recuerda entre charlas libres. Con sesión → profiles.tutor_memory;
// invitado → localStorage. Tope de 8, sin duplicados.
import { createClient } from "@/lib/supabase/client";

const LS = "em_tutor_memory";
const MAX = 8;

const norm = (s: string) => s.trim().toLowerCase();

export function mergeFacts(existing: string[], incoming: string[]): string[] {
  const out = [...existing];
  for (const f of incoming) {
    const t = (f ?? "").trim();
    if (!t) continue;
    if (out.some((e) => norm(e) === norm(t))) continue;
    out.push(t);
  }
  // conserva los más recientes si excede el tope
  return out.slice(-MAX);
}

export async function loadMemory(): Promise<string[]> {
  try {
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      const { data } = await sb.from("profiles").select("tutor_memory").eq("id", user.id).single();
      const m = data?.tutor_memory;
      if (Array.isArray(m)) return m.filter((x): x is string => typeof x === "string").slice(-MAX);
      return [];
    }
  } catch {
    /* fallback */
  }
  try {
    const v = localStorage.getItem(LS);
    if (v) {
      const arr = JSON.parse(v);
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string").slice(-MAX);
    }
  } catch {
    /* */
  }
  return [];
}

export async function saveMemory(facts: string[]): Promise<void> {
  const capped = facts.slice(-MAX);
  try {
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      await sb.from("profiles").update({ tutor_memory: capped }).eq("id", user.id);
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    localStorage.setItem(LS, JSON.stringify(capped));
  } catch {
    /* */
  }
}

export async function clearMemory(): Promise<void> {
  await saveMemory([]);
}
