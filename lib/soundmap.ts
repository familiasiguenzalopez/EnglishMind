import { createClient } from "@/lib/supabase/client";

// "Mapa de sonidos": el mejor estado alcanzado por sonido, para ver la mejora
// en el tiempo. Persistente: pronunciation_events (con sesión) + localStorage.
export type SoundStatus = "correct" | "improve" | "unintelligible";

const LS = "em_soundmap";
const RANK: Record<SoundStatus, number> = {
  correct: 3,
  improve: 2,
  unintelligible: 1,
};

function readLocal(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LS) || "{}");
  } catch {
    return {};
  }
}

export async function loadSoundMap(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("pronunciation_events")
        .select("phoneme,status")
        .eq("user_id", user.id);
      const map: Record<string, string> = {};
      (data ?? []).forEach((e: { phoneme: string; status: string }) => {
        const prev = map[e.phoneme];
        if (!prev || (RANK[e.status as SoundStatus] ?? 0) > (RANK[prev as SoundStatus] ?? 0)) {
          map[e.phoneme] = e.status;
        }
      });
      return map;
    }
  } catch {
    /* fallback a local */
  }
  return readLocal();
}

export async function recordSound(
  soundId: string,
  status: SoundStatus,
  score: number,
): Promise<void> {
  // Mejor estado local (instantáneo para la UI)
  try {
    const m = readLocal();
    if (!m[soundId] || RANK[status] > (RANK[m[soundId] as SoundStatus] ?? 0)) {
      m[soundId] = status;
      localStorage.setItem(LS, JSON.stringify(m));
    }
  } catch {
    /* ignore */
  }
  // Evento durable si hay sesión
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("pronunciation_events")
        .insert({ user_id: user.id, phoneme: soundId, status, score });
    }
  } catch {
    /* invitado o error */
  }
}
