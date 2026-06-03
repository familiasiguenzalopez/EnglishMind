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
  const level = Math.floor(xp / META) + 1;
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, k) => {
    const ago = 6 - k;
    const d = new Date(today);
    d.setDate(today.getDate() - ago);
    return { letter: "DLMMJVS"[d.getDay()], active: ago < streak, isToday: ago === 0 };
  });

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CefrBadge level={(cefr ?? "A1") as CefrLevel} />
          <span className="rounded-full bg-surface3 px-2 py-0.5 text-xs font-bold text-ink">
            Nivel {level}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
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

      {/* Racha semanal (estilo ELSA) */}
      <div className="mt-3 flex items-center justify-between">
        {week.map((d, k) => (
          <div key={k} className="flex flex-col items-center gap-1">
            <span className={"text-[10px] " + (d.isToday ? "font-bold text-[#ffc24b]" : "text-ink-dim")}>
              {d.letter}
            </span>
            <span
              className={
                "grid h-7 w-7 place-items-center rounded-full text-[11px] " +
                (d.active ? "text-bg" : "bg-surface3 text-ink-dim") +
                (d.isToday ? " ring-2 ring-[#ffc24b]" : "")
              }
              style={d.active ? { background: "linear-gradient(135deg,#ff7a59,#ffc24b)", color: "#1a1030" } : undefined}
            >
              {d.active ? "🔥" : "·"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
