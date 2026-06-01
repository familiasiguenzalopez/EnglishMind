"use client";

import { useEffect, useState } from "react";
import { touchStreak } from "@/lib/gamify";

// Mascota + toast que CELEBRA y acompaña, nunca culpa ni presiona.
// Escucha eventos "em-celebrate" (XP/logros) y saluda el regreso al montar.

type Pop = { id: number; text: string; mascot: string };

export function Celebration() {
  const [pops, setPops] = useState<Pop[]>([]);

  useEffect(() => {
    function push(text: string, mascot: string) {
      const id = Date.now() + Math.random();
      setPops((ps) => [...ps, { id, text, mascot }]);
      setTimeout(() => setPops((ps) => ps.filter((x) => x.id !== id)), 3400);
    }

    try {
      const { returned } = touchStreak();
      if (returned) {
        push("¡Qué bueno verte de nuevo! Seguimos donde lo dejaste.", "🦜");
      }
    } catch {
      /* ignore */
    }

    function onCelebrate(e: Event) {
      const d = (e as CustomEvent).detail ?? {};
      if (d.achievement) push(`Logro: ${d.achievement}`, "🏆");
      else if (d.xp) push(`+${d.xp} XP · ¡bien hecho!`, "🦜");
    }

    window.addEventListener("em-celebrate", onCelebrate);
    return () => window.removeEventListener("em-celebrate", onCelebrate);
  }, []);

  if (pops.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {pops.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-2 rounded-full border border-secondary bg-surface3 px-4 py-2.5 text-sm font-semibold text-ink shadow-lg"
          style={{ animation: "em-pop .35s ease" }}
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-sm"
            style={{
              background:
                "linear-gradient(135deg,var(--color-primary),var(--color-secondary))",
            }}
          >
            {p.mascot}
          </span>
          {p.text}
        </div>
      ))}
    </div>
  );
}
