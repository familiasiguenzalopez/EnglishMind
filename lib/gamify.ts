// Gamificación sin patrones oscuros (Sección 10): XP por competencia,
// racha que CELEBRA el regreso (nunca culpa), logros ligados a can-do.
// Con sesión: el servidor (Supabase, RPC record_activity) es la fuente de
// verdad → persiste por usuario y multidispositivo. Sin sesión: localStorage.

import { createClient } from "@/lib/supabase/client";

export type GamifyState = {
  xp: number;
  streakDays: number;
  lastActive: string | null;
  achievements: string[];
};

const KEY = "em_gamify_v1";
const EMPTY: GamifyState = { xp: 0, streakDays: 0, lastActive: null, achievements: [] };

// ── localStorage (invitados) ──────────────────────────────
export function getState(): GamifyState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<GamifyState>) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function saveLocal(s: GamifyState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* almacenamiento lleno: ignorar */
  }
}

function emitTotals(xp: number, streakDays: number) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("em-gamify", { detail: { xp, streakDays } }));
}
function emitCelebrate(xp: number, achievement: string | null) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("em-celebrate", { detail: { xp, achievement } }));
}

async function userId(): Promise<string | null> {
  try {
    const { data } = await createClient().auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

/** Lee el estado: del servidor si hay sesión; si no, de localStorage. */
export async function loadState(): Promise<GamifyState> {
  const uid = await userId();
  if (uid) {
    try {
      const { data } = await createClient()
        .from("profiles")
        .select("xp,streak_days,last_active,achievements")
        .eq("id", uid)
        .single();
      if (data) {
        return {
          xp: data.xp ?? 0,
          streakDays: data.streak_days ?? 0,
          lastActive: data.last_active ?? null,
          achievements: (data.achievements ?? []) as string[],
        };
      }
    } catch {
      /* fallback abajo */
    }
  }
  return getState();
}

/** Marca actividad/racha. Servidor si hay sesión; si no, localStorage. */
export async function touchStreak(): Promise<{
  xp: number;
  streakDays: number;
  returned: boolean;
}> {
  const uid = await userId();
  if (uid) {
    try {
      const { data } = await createClient().rpc("record_activity", {
        p_xp: 0,
        p_achievement: null,
        p_achievement_label: null,
      });
      const row = Array.isArray(data) ? data[0] : data;
      const xp = row?.xp ?? 0;
      const streak = row?.streak_days ?? 0;
      emitTotals(xp, streak);
      return { xp, streakDays: streak, returned: false };
    } catch {
      /* fallback */
    }
  }
  const s = getState();
  const t = today();
  let returned = false;
  if (s.lastActive !== t) {
    if (!s.lastActive) {
      s.streakDays = 1;
    } else {
      const gap = daysBetween(s.lastActive, t);
      if (gap === 1) s.streakDays += 1;
      else {
        s.streakDays = 1;
        if (gap > 1) returned = true;
      }
    }
    s.lastActive = t;
    saveLocal(s);
    emitTotals(s.xp, s.streakDays);
  }
  return { xp: s.xp, streakDays: s.streakDays, returned };
}

/** Otorga XP por competencia. Servidor si hay sesión; si no, localStorage. */
export async function award(xp: number, achievement?: { id: string; label: string }) {
  const uid = await userId();
  if (uid) {
    try {
      const { data } = await createClient().rpc("record_activity", {
        p_xp: xp,
        p_achievement: achievement?.id ?? null,
        p_achievement_label: achievement?.label ?? null,
      });
      const row = Array.isArray(data) ? data[0] : data;
      emitTotals(row?.xp ?? 0, row?.streak_days ?? 0);
      emitCelebrate(xp, row?.new_achievement ?? null);
      return;
    } catch {
      /* fallback */
    }
  }
  const s = getState();
  s.xp += xp;
  s.lastActive = today();
  let unlocked: string | null = null;
  if (achievement && !s.achievements.includes(achievement.id)) {
    s.achievements.push(achievement.id);
    unlocked = achievement.label;
  }
  saveLocal(s);
  emitTotals(s.xp, s.streakDays);
  emitCelebrate(xp, unlocked);
}
