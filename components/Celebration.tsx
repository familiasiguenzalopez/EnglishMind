"use client";

import { useEffect, useState } from "react";
import { touchStreak } from "@/lib/gamify";
import { Mascot } from "@/components/Mascot";

// Mascota + toast que CELEBRA y acompaña, nunca culpa ni presiona.
// Escucha "em-celebrate" (XP/logros), lanza confeti y saluda el regreso.

type Pop = { id: number; text: string; mascot: string };

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--warning)",
];
const EMOJIS = ["🎉", "✨", "⭐"];

function ConfettiBurst() {
  const pieces = Array.from({ length: 14 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 80;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist + 50; // tiende a caer
    const rot = (Math.random() * 2 - 1) * 360;
    return {
      i,
      style: {
        ["--dx"]: `${dx}px`,
        ["--dy"]: `${dy}px`,
        ["--rot"]: `${rot}deg`,
        animationDelay: `${Math.random() * 0.08}s`,
      } as React.CSSProperties,
      emoji: i % 5 === 0 ? EMOJIS[i % EMOJIS.length] : null,
      color: COLORS[i % COLORS.length],
    };
  });
  return (
    <div className="pointer-events-none fixed left-1/2 top-1/3 z-[59]" aria-hidden>
      {pieces.map((p) => (
        <span key={p.i} className="em-confetti absolute" style={p.style}>
          {p.emoji ? (
            <span className="text-base">{p.emoji}</span>
          ) : (
            <span className="block h-2 w-2 rounded-[2px]" style={{ background: p.color }} />
          )}
        </span>
      ))}
    </div>
  );
}

export function Celebration() {
  const [pops, setPops] = useState<Pop[]>([]);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    function push(text: string, mascot: string) {
      const id = Date.now() + Math.random();
      setPops((ps) => [...ps, { id, text, mascot }]);
      setTimeout(() => setPops((ps) => ps.filter((x) => x.id !== id)), 3400);
    }
    function celebrate() {
      const id = Date.now();
      setBurst(id);
      setTimeout(() => setBurst((b) => (b === id ? 0 : b)), 1100);
    }

    touchStreak()
      .then(({ returned }) => {
        if (returned) push("¡Qué bueno verte de nuevo! Seguimos donde lo dejaste.", "🦜");
      })
      .catch(() => {});

    function onCelebrate(e: Event) {
      const d = (e as CustomEvent).detail ?? {};
      if (d.achievement) {
        push(`Logro: ${d.achievement}`, "🏆");
        celebrate();
      } else if (d.xp) {
        push(`+${d.xp} XP · ¡bien hecho!`, "🦜");
        celebrate();
      }
    }

    window.addEventListener("em-celebrate", onCelebrate);
    return () => window.removeEventListener("em-celebrate", onCelebrate);
  }, []);

  return (
    <>
      {burst > 0 && <ConfettiBurst key={burst} />}
      {pops.length > 0 && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
          {pops.map((p) => (
            <div
              key={p.id}
              className="em-bounce-in flex items-center gap-2 rounded-full border border-secondary bg-surface3 px-4 py-2.5 text-sm font-semibold text-ink shadow-lg"
            >
              {p.mascot === "🦜" ? (
                <span className="em-wiggle">
                  <Mascot state="speaking" size={38} />
                </span>
              ) : (
                <span
                  className="em-wiggle grid h-6 w-6 place-items-center rounded-full text-sm"
                  style={{
                    background: "linear-gradient(135deg,var(--color-primary),var(--color-secondary))",
                  }}
                >
                  {p.mascot}
                </span>
              )}
              {p.text}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
