"use client";

import { useEffect, useState } from "react";
import { CefrBadge, type CefrLevel } from "@/components/ui/CefrBadge";
import { loadState } from "@/lib/gamify";
import { loadCefr } from "@/lib/level";

// Cabecera del home: nivel + racha + XP. Lee del servidor si hay sesión
// (persistente, multidispositivo); si no, del estado on-device.
const META = 200; // XP por "nivel" de progreso (cosmético)

export function XpStreak() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [cefr, setCefr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadState().then((s) => {
      if (mounted) {
        setXp(s.xp);
        setStreak(s.streakDays);
      }
    });
    loadCefr().then((c) => {
      if (mounted) setCefr(c);
    });
    const onGamify = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {};
      if (typeof d.xp === "number") setXp(d.xp);
      if (typeof d.streakDays === "number") setStreak(d.streakDays);
    };
    window.addEventListener("em-gamify", onGamify);
    return () => {
      mounted = false;
      window.removeEventListener("em-gamify", onGamify);
    };
  }, []);

  const pct = Math.min(100, Math.round(((xp % META) / META) * 100));

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CefrBadge level={(cefr ?? "A1") as CefrLevel} />
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
