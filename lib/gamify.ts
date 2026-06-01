// Gamificación sin patrones oscuros (Sección 10): XP por competencia demostrada
// (no por tiempo de pantalla), racha que CELEBRA el regreso (nunca culpa),
// logros ligados a can-do. Estado on-device (localStorage), credential-free.

export type GamifyState = {
  xp: number;
  streakDays: number;
  lastActive: string | null;
  achievements: string[];
};

const KEY = "em_gamify_v1";
const EMPTY: GamifyState = { xp: 0, streakDays: 0, lastActive: null, achievements: [] };

export function getState(): GamifyState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<GamifyState>) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function save(s: GamifyState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* almacenamiento lleno: ignorar */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("em-gamify", { detail: s }));
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

/** Marca actividad de hoy y actualiza la racha. Celebra el regreso, nunca culpa. */
export function touchStreak(): { state: GamifyState; returned: boolean } {
  const s = getState();
  const t = today();
  let returned = false;
  if (s.lastActive !== t) {
    if (!s.lastActive) {
      s.streakDays = 1;
    } else {
      const gap = daysBetween(s.lastActive, t);
      if (gap === 1) {
        s.streakDays += 1;
      } else {
        s.streakDays = 1;
        if (gap > 1) returned = true;
      }
    }
    s.lastActive = t;
    save(s);
  }
  return { state: s, returned };
}

/** Otorga XP por competencia demostrada. Dispara la celebración (mascota/toast). */
export function award(xp: number, achievement?: { id: string; label: string }) {
  const s = getState();
  s.xp += xp;
  s.lastActive = today();
  let unlocked: string | null = null;
  if (achievement && !s.achievements.includes(achievement.id)) {
    s.achievements.push(achievement.id);
    unlocked = achievement.label;
  }
  save(s);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("em-celebrate", { detail: { xp, achievement: unlocked } }),
    );
  }
  return s;
}
