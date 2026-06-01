"use client";

import { useEffect, useState } from "react";
import { CefrBadge } from "@/components/ui/CefrBadge";
import { getState, type GamifyState } from "@/lib/gamify";

// Cabecera del home: nivel + racha + XP, leídos del estado on-device.
const META = 200; // XP por "nivel" de progreso (cosmético)

export function XpStreak() {
  const [s, setS] = useState<GamifyState | null>(null);

  useEffect(() => {
    const refresh = () => setS(getState());
    refresh();
    window.addEventListener("em-gamify", refresh);
    window.addEventListener("em-celebrate", refresh);
    return () => {
      window.removeEventListener("em-gamify", refresh);
      window.removeEventListener("em-celebrate", refresh);
    };
  }, []);

  const xp = s?.xp ?? 0;
  const streak = s?.streakDays ?? 0;
  const pct = Math.min(100, Math.round(((xp % META) / META) * 100));

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CefrBadge level="A2" />
          <span className="text-sm text-ink-muted">Tu nivel</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-ink">
            🔥 {streak} {streak === 1 ? "día" : "días"}
          </span>
          <span className="text-ink-muted">{xp} XP</span>
        </div>
      </header>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface3">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </>
  );
}
