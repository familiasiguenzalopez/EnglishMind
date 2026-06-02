"use client";

import type { Scene } from "@/lib/scenes";

// Fondo ambientado de una escena: degradado + emojis flotantes (sutiles).
// Se difumina hacia --surface abajo para que el texto del chat siga legible.
export function SceneBackground({
  scene,
  className = "",
  fade = true,
}: {
  scene: Scene;
  className?: string;
  fade?: boolean;
}) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${scene.bg[0]}, ${scene.bg[1]})` }} />
      {scene.motifs.map((m, i) => (
        <span
          key={i}
          className="em-float absolute"
          style={{
            left: `${10 + i * 26}%`,
            top: `${8 + (i % 3) * 18}%`,
            opacity: 0.16,
            fontSize: `${1.7 + (i % 3) * 0.6}rem`,
            animationDelay: `${i * 0.9}s`,
          }}
        >
          {m}
        </span>
      ))}
      {fade && (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 35%, var(--surface) 100%)" }}
        />
      )}
    </div>
  );
}
