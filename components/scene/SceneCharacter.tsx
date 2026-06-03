"use client";

import { useEffect, useRef, useState } from "react";
import type { Scene } from "@/lib/scenes";
import { DEFAULT_LOOK, loadLook, type AvatarLook } from "@/lib/avatar";

export type CharState = "idle" | "speaking" | "listening" | "thinking";

// Personaje 2D animado (SVG puro). Reacciona al estado y hace LIP-SYNC: `pulse`
// se incrementa por cada palabra hablada (evento onboundary del TTS) y abre la
// boca un instante. Si el navegador no emite esos eventos, cae al bucle CSS.
//  · speaking  → boca sincronizada + cejas + cabeceo + anillos de sonido
//  · listening → boca atenta + cejas arriba + leve inclinación + anillo
//  · thinking  → mirada arriba + 💭
//  · idle      → parpadeo + mirada que vaga + respiración
export function SceneCharacter({
  scene,
  state,
  look,
  size = 132,
  pulse = 0,
}: {
  scene: Scene;
  state: CharState;
  look?: AvatarLook;
  size?: number;
  pulse?: number;
}) {
  const [auto, setAuto] = useState<AvatarLook>(DEFAULT_LOOK);
  useEffect(() => {
    if (!look) setAuto(loadLook());
  }, [look]);
  const lk = look ?? auto;

  const speaking = state === "speaking";
  const listening = state === "listening";
  const thinking = state === "thinking";

  // Lip-sync: cada palabra (pulse) abre la boca; si no hay pulses, usa el bucle CSS.
  const [mouthOpen, setMouthOpen] = useState(false);
  const [boundaryMode, setBoundaryMode] = useState(false);
  const lastPulse = useRef(0);
  useEffect(() => {
    if (pulse && pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      setBoundaryMode(true);
      setMouthOpen(true);
      const t = setTimeout(() => setMouthOpen(false), 130);
      return () => clearTimeout(t);
    }
  }, [pulse]);
  useEffect(() => {
    if (!speaking) {
      setBoundaryMode(false);
      setMouthOpen(false);
    }
  }, [speaking]);

  const headClass = speaking ? "em-speak" : listening ? "em-listen" : "em-bob";
  const browClass = speaking || listening ? "em-brow" : undefined;
  const eyesClass = !speaking && !listening && !thinking ? "em-look" : undefined;
  const eyesStyle = thinking ? { transform: "translateY(-1.6px)" } : undefined;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* Halo */}
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
        <g className={headClass}>
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
          {/* Cejas (expresivas al hablar/escuchar) */}
          <rect className={browClass} x="36" y="40" width="10" height="2.4" rx="1.2" fill={lk.hair} />
          <rect className={browClass} x="54" y="40" width="10" height="2.4" rx="1.2" fill={lk.hair} />
          {/* Ojos (parpadean; miran arriba al pensar; vagan en reposo) */}
          <g className={eyesClass} style={eyesStyle}>
            <ellipse className="em-eye" cx="41" cy="48" rx="3.2" ry="4.3" fill="#1c1c22" />
            <ellipse className="em-eye" cx="59" cy="48" rx="3.2" ry="4.3" fill="#1c1c22" />
          </g>
          {/* Mejillas */}
          <circle cx="35" cy="57" r="3.2" fill="#ff8a6a" opacity="0.4" />
          <circle cx="65" cy="57" r="3.2" fill="#ff8a6a" opacity="0.4" />
          {/* Boca: lip-sync por palabra, o bucle CSS, o atenta, o sonrisa */}
          {speaking ? (
            boundaryMode ? (
              <ellipse
                cx="50"
                cy="61"
                rx="6"
                ry="5"
                fill="#5b2330"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: `scaleY(${mouthOpen ? 1 : 0.22})`,
                  transition: "transform 80ms ease",
                }}
              />
            ) : (
              <ellipse className="em-mouth-talk" cx="50" cy="61" rx="6" ry="4.6" fill="#5b2330" />
            )
          ) : listening ? (
            <ellipse cx="50" cy="60" rx="3.4" ry="2.6" fill="#5b2330" />
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
