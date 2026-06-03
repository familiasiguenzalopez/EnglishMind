"use client";

import { useEffect, useState } from "react";
import type { Scene } from "@/lib/scenes";
import { DEFAULT_LOOK, loadLook, type AvatarLook } from "@/lib/avatar";

export type CharState = "idle" | "speaking" | "listening" | "thinking";

// Personaje 2D animado (SVG puro). Reacciona al estado:
//  · speaking  → mueve la boca + anillos de sonido
//  · listening → anillo de "escucha"
//  · thinking  → burbuja 💭
// El "look" (piel/cabello/ropa) se puede pasar por prop o se lee de localStorage.
export function SceneCharacter({
  scene,
  state,
  look,
  size = 132,
}: {
  scene: Scene;
  state: CharState;
  look?: AvatarLook;
  size?: number;
}) {
  const [auto, setAuto] = useState<AvatarLook>(DEFAULT_LOOK);
  useEffect(() => {
    if (!look) setAuto(loadLook());
  }, [look]);
  const lk = look ?? auto;

  const speaking = state === "speaking";
  const listening = state === "listening";
  const thinking = state === "thinking";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* Halo de la escena */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle at 50% 45%, ${scene.ring}40, transparent 70%)` }}
      />

      {/* Anillos de sonido al hablar */}
      {speaking && (
        <>
          <span className="em-ripple absolute h-full w-full rounded-full" style={{ border: `2px solid ${scene.ring}` }} />
          <span
            className="em-ripple absolute h-full w-full rounded-full"
            style={{ border: `2px solid ${scene.ring}`, animationDelay: "0.8s" }}
          />
        </>
      )}
      {/* Anillo de escucha */}
      {listening && (
        <span
          className="absolute h-[88%] w-[88%] animate-ping rounded-full"
          style={{ border: "2px solid var(--color-primary)" }}
        />
      )}

      <svg viewBox="0 0 100 116" width={size * 0.82} height={size * 0.95} className="relative">
        <g className={speaking ? "em-speak" : "em-bob"}>
          {/* Hombros / torso */}
          <rect x="20" y="86" width="60" height="34" rx="22" fill={lk.shirt} />
          {/* Cuello */}
          <rect x="44" y="70" width="12" height="14" fill={lk.skin} />
          {/* Cabeza */}
          <circle cx="50" cy="48" r="27" fill={lk.skin} />
          {/* Orejas */}
          <circle cx="23" cy="50" r="4" fill={lk.skin} />
          <circle cx="77" cy="50" r="4" fill={lk.skin} />
          {/* Cabello (corona + fleco) */}
          <path d="M23 48 A27 27 0 0 1 77 48 Q64 39 50 40 Q36 39 23 48 Z" fill={lk.hair} />
          {/* Cejas (expresivas al hablar) */}
          <rect className={speaking ? "em-brow" : undefined} x="36" y="40" width="10" height="2.4" rx="1.2" fill={lk.hair} />
          <rect className={speaking ? "em-brow" : undefined} x="54" y="40" width="10" height="2.4" rx="1.2" fill={lk.hair} />
          {/* Ojos (parpadean) */}
          <ellipse className="em-eye" cx="41" cy="48" rx="3.2" ry="4.3" fill="#1c1c22" />
          <ellipse className="em-eye" cx="59" cy="48" rx="3.2" ry="4.3" fill="#1c1c22" />
          {/* Mejillas */}
          <circle cx="35" cy="57" r="3.2" fill="#ff8a6a" opacity="0.4" />
          <circle cx="65" cy="57" r="3.2" fill="#ff8a6a" opacity="0.4" />
          {/* Boca: habla (elipse animada) o sonrisa */}
          {speaking ? (
            <ellipse className="em-mouth-talk" cx="50" cy="61" rx="6" ry="4.6" fill="#5b2330" />
          ) : (
            <path d="M43 60 q7 6.5 14 0" stroke="#5b2330" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          )}
        </g>
      </svg>

      {/* Badge de rol / pensando */}
      <div
        className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full text-lg shadow-lg"
        style={{ background: "var(--surface3)", border: `2px solid ${scene.ring}` }}
      >
        {thinking ? <span className="animate-pulse">💭</span> : <span>{scene.emoji}</span>}
      </div>
    </div>
  );
}
