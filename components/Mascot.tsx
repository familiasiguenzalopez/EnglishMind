"use client";

import { useEffect, useRef, useState } from "react";
import type { CharState } from "@/components/scene/SceneCharacter";

// Mascota de marca de EnglishMind: un loro 🦜 (SVG dibujado a mano, sin arte
// externo). Anima por estado y hace lip-sync: `pulse` se incrementa por cada
// palabra hablada (onboundary del TTS) y abre el pico; si no hay pulses, cae al
// bucle CSS. Paleta de marca (teal/coral/violeta). Respeta prefers-reduced-motion.
export function Mascot({
  state = "idle",
  size = 120,
  pulse = 0,
}: {
  state?: CharState;
  size?: number;
  pulse?: number;
}) {
  const speaking = state === "speaking";
  const listening = state === "listening";
  const thinking = state === "thinking";

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
  const eyesStyle = thinking ? ({ transform: "translateY(-1.4px)" } as const) : undefined;
  const lowerBeak =
    speaking && boundaryMode
      ? {
          props: {} as Record<string, never>,
          style: {
            transformBox: "fill-box" as const,
            transformOrigin: "center top",
            transform: `scaleY(${mouthOpen ? 1 : 0.18})`,
            transition: "transform 80ms ease",
          },
        }
      : speaking
        ? { props: { className: "em-beak" }, style: undefined }
        : { props: {}, style: undefined };

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* Halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 45%, rgba(39,224,196,0.30), transparent 70%)" }}
      />
      {/* Anillos al hablar */}
      {speaking && (
        <>
          <span className="em-ripple absolute h-full w-full rounded-full" style={{ border: "2px solid #27e0c4" }} />
          <span
            className="em-ripple absolute h-full w-full rounded-full"
            style={{ border: "2px solid #27e0c4", animationDelay: "0.8s" }}
          />
        </>
      )}
      {listening && (
        <span
          className="absolute h-[88%] w-[88%] animate-ping rounded-full"
          style={{ border: "2px solid var(--color-primary)" }}
        />
      )}

      <svg viewBox="0 0 100 116" width={size * 0.92} height={size} className="relative">
        <g className={headClass}>
          {/* Alas */}
          <ellipse cx="24" cy="82" rx="9" ry="19" fill="#12b3a1" />
          <ellipse cx="76" cy="82" rx="9" ry="19" fill="#12b3a1" />
          {/* Cuerpo */}
          <ellipse cx="50" cy="82" rx="27" ry="30" fill="#27e0c4" />
          {/* Panza */}
          <ellipse cx="50" cy="88" rx="15" ry="18" fill="#bdf3ea" />
          {/* Cresta (plumas) */}
          <ellipse cx="42" cy="17" rx="3" ry="8" fill="#9b6bff" transform="rotate(-22 42 17)" />
          <ellipse cx="50" cy="13" rx="3.5" ry="9" fill="#ff6b3d" />
          <ellipse cx="58" cy="17" rx="3" ry="8" fill="#9b6bff" transform="rotate(22 58 17)" />
          {/* Cabeza */}
          <circle cx="50" cy="40" r="23" fill="#27e0c4" />
          {/* Máscara facial */}
          <ellipse cx="50" cy="44" rx="17" ry="15" fill="#d9f7f0" />
          {/* Ojos (parpadean; miran arriba al pensar) */}
          <g style={eyesStyle}>
            <g className="em-eye">
              <circle cx="41" cy="38" r="6.4" fill="#ffffff" stroke="#0f8e80" strokeWidth="0.8" />
              <circle cx="42" cy="39" r="3.2" fill="#1c1c22" />
            </g>
            <g className="em-eye">
              <circle cx="59" cy="38" r="6.4" fill="#ffffff" stroke="#0f8e80" strokeWidth="0.8" />
              <circle cx="58" cy="39" r="3.2" fill="#1c1c22" />
            </g>
          </g>
          {/* Mejillas */}
          <circle cx="33" cy="48" r="3.6" fill="#ff8a6a" opacity="0.45" />
          <circle cx="67" cy="48" r="3.6" fill="#ff8a6a" opacity="0.45" />
          {/* Pico superior (gancho de loro) */}
          <path d="M40 48 Q50 43 60 48 Q58 59 50 63 Q42 59 40 48 Z" fill="#ff6b3d" />
          {/* Pico inferior (se abre al hablar) */}
          <ellipse cx="50" cy="59" rx="6" ry="3" fill="#e0552e" {...lowerBeak.props} style={lowerBeak.style} />
        </g>
      </svg>

      {thinking && <div className="absolute right-0 top-0 animate-pulse text-lg">💭</div>}
    </div>
  );
}
