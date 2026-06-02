// ════════════════════════════════════════════════════════════
// Camino de aprendizaje (metodología). Puro: calcula el estado de cada
// lección a partir de las unidades de una ruta + las lecciones completadas.
// Progresión estilo "journey": vas avanzando lección a lección; la actual
// queda resaltada y, con sesión, lo que sigue se bloquea hasta completar.
// ════════════════════════════════════════════════════════════

export type PathLesson = { id: string; title: string; kind: string; sort_order: number };
export type PathUnit = {
  id: string;
  title: string;
  cefr_target: string | null;
  can_do: string | null;
  sort_order: number;
  lessons: PathLesson[];
};

export type NodeState = "done" | "current" | "available" | "locked";
export type LessonNode = PathLesson & { state: NodeState; unitId: string };
export type UnitWithNodes = PathUnit & { nodes: LessonNode[]; doneCount: number };

export type LearningPath = {
  units: UnitWithNodes[];
  next?: LessonNode; // lección para "continuar"
  totalLessons: number;
  doneLessons: number;
  complete: boolean;
};

const KIND_ICON: Record<string, string> = {
  scenario: "💬",
  pronunciation: "🗣️",
  writing: "✍️",
  vocab: "🔤",
};

export function lessonIcon(kind: string): string {
  return KIND_ICON[kind] ?? "🎧";
}

function bySort<T extends { sort_order: number }>(a: T, b: T) {
  return a.sort_order - b.sort_order;
}

// locking=true (con sesión): bloquea lo que viene después de la lección actual.
// locking=false (invitado): todo accesible, la primera es la "actual".
export function buildPath(
  rawUnits: PathUnit[],
  completed: Set<string>,
  locking: boolean,
): LearningPath {
  const units = rawUnits.slice().sort(bySort);
  let foundCurrent = false;
  let total = 0;
  let done = 0;

  const withNodes: UnitWithNodes[] = units.map((u) => {
    const lessons = u.lessons.slice().sort(bySort);
    let doneCount = 0;
    const nodes: LessonNode[] = lessons.map((l) => {
      total += 1;
      let state: NodeState;
      if (completed.has(l.id)) {
        state = "done";
        doneCount += 1;
        done += 1;
      } else if (!foundCurrent) {
        state = "current";
        foundCurrent = true;
      } else {
        state = locking ? "locked" : "available";
      }
      return { ...l, state, unitId: u.id };
    });
    return { ...u, lessons, nodes, doneCount };
  });

  let next: LessonNode | undefined;
  for (const u of withNodes) {
    const c = u.nodes.find((n) => n.state === "current");
    if (c) {
      next = c;
      break;
    }
  }

  return {
    units: withNodes,
    next,
    totalLessons: total,
    doneLessons: done,
    complete: total > 0 && done === total,
  };
}

// Rango CEFR cubierto por la ruta (p. ej. "A2 – B2").
export function cefrRange(units: PathUnit[]): string | null {
  const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const present = units
    .map((u) => (u.cefr_target || "").toUpperCase())
    .filter((c) => order.includes(c))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (!present.length) return null;
  const lo = present[0];
  const hi = present[present.length - 1];
  return lo === hi ? lo : `${lo} – ${hi}`;
}
