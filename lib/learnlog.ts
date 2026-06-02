// Hilo de aprendizaje (cliente). Registra los focos de cada práctica y calcula
// tendencias: en qué trabaja el alumno ahora vs qué patrones va SUPERANDO.
//
// Modelo: cada sesión inserta una fila centinela ('__session__') + una por foco.
// "clean streak" de una categoría = nº de sesiones POSTERIORES a su última
// aparición. streak alto + varias apariciones previas ⇒ está superando ese error.
import { createClient } from "@/lib/supabase/client";
import { skillLabel } from "@/lib/skills";

export type Focus = { category: string; note?: string };
export type Insight = { category: string; label: string; count: number; streak: number };

const SENTINEL = "__session__";

type Ev = { source: string; category: string; created_at: string };

function aggregate(events: Ev[]) {
  const sessionTimes = events
    .filter((e) => e.category === SENTINEL)
    .map((e) => Date.parse(e.created_at))
    .sort((a, b) => a - b);

  const cats = new Map<string, { count: number; lastSeen: number }>();
  for (const e of events) {
    if (e.category === SENTINEL) continue;
    const cur = cats.get(e.category) ?? { count: 0, lastSeen: 0 };
    cur.count += 1;
    const t = Date.parse(e.created_at);
    if (t > cur.lastSeen) cur.lastSeen = t;
    cats.set(e.category, cur);
  }

  const out = new Map<string, { count: number; streak: number }>();
  for (const [cat, v] of cats) {
    const streak = sessionTimes.filter((t) => t > v.lastSeen).length;
    out.set(cat, { count: v.count, streak });
  }
  return { totalSessions: sessionTimes.length, cats: out };
}

async function fetchEvents(
  sb: ReturnType<typeof createClient>,
  userId: string,
): Promise<Ev[]> {
  const { data } = await sb
    .from("skill_events")
    .select("source,category,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(500);
  return (data ?? []) as Ev[];
}

// Registra una práctica y devuelve los patrones que el alumno acaba de superar
// (para alentarlo en el momento). No falla si es invitado.
export async function recordSession(
  source: "conversation" | "writing" | "pronunciation",
  lessonId: string | null,
  level: string,
  focus: Focus[],
): Promise<{ improved: Insight[] }> {
  try {
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { improved: [] };

    const batch_id = crypto.randomUUID();
    const rows = [
      { user_id: user.id, batch_id, source, lesson_id: lessonId, category: SENTINEL, label: null, note: null, level },
      ...focus
        .filter((f) => f && f.category && f.category !== SENTINEL)
        .map((f) => ({
          user_id: user.id,
          batch_id,
          source,
          lesson_id: lessonId,
          category: f.category,
          label: skillLabel(f.category),
          note: f.note ?? null,
          level,
        })),
    ];
    await sb.from("skill_events").insert(rows);

    const events = await fetchEvents(sb, user.id);
    const { cats } = aggregate(events);
    const thisCats = new Set(focus.map((f) => f.category));
    const improved: Insight[] = [];
    for (const [cat, v] of cats) {
      // "El momento justo": acaba de cruzar 2-3 sesiones limpias de un patrón
      // que antes repetía, y hoy NO lo cometió.
      if (v.count >= 2 && (v.streak === 2 || v.streak === 3) && !thisCats.has(cat)) {
        improved.push({ category: cat, label: skillLabel(cat), count: v.count, streak: v.streak });
      }
    }
    improved.sort((a, b) => b.count - a.count);
    return { improved: improved.slice(0, 2) };
  } catch {
    return { improved: [] };
  }
}

// Para la vista "Tu hilo de aprendizaje".
export async function loadInsights(): Promise<{
  working: Insight[];
  improving: Insight[];
  totalSessions: number;
}> {
  try {
    const sb = createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { working: [], improving: [], totalSessions: 0 };

    const events = await fetchEvents(sb, user.id);
    const { cats, totalSessions } = aggregate(events);
    const arr: Insight[] = [...cats].map(([cat, v]) => ({
      category: cat,
      label: skillLabel(cat),
      count: v.count,
      streak: v.streak,
    }));
    const working = arr.filter((x) => x.streak <= 1).sort((a, b) => b.count - a.count).slice(0, 6);
    const improving = arr.filter((x) => x.count >= 2 && x.streak >= 2).sort((a, b) => b.streak - a.streak).slice(0, 6);
    return { working, improving, totalSessions };
  } catch {
    return { working: [], improving: [], totalSessions: 0 };
  }
}
