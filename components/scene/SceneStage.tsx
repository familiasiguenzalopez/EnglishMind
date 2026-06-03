"use client";

import type { Scene } from "@/lib/scenes";
import type { AvatarLook } from "@/lib/avatar";
import { SceneBackground } from "./SceneBackground";
import { SceneCharacter, type CharState } from "./SceneCharacter";
import { Mascot } from "@/components/Mascot";

// "Escenario" de la práctica: fondo ambientado + personaje 2D + estado.
export function SceneStage({
  scene,
  state,
  look,
  pulse = 0,
}: {
  scene: Scene;
  state: CharState;
  look?: AvatarLook;
  pulse?: number;
}) {
  const status =
    state === "speaking"
      ? "hablando…"
      : state === "listening"
        ? "escuchando…"
        : state === "thinking"
          ? "pensando…"
          : "";

  return (
    <div className="relative overflow-hidden rounded-lg border border-line" style={{ minHeight: 196 }}>
      <SceneBackground scene={scene} />
      <div className="relative flex flex-col items-center px-3 pt-4 pb-3">
        {scene.id === "tutor" ? (
          <Mascot state={state} pulse={pulse} />
        ) : (
          <SceneCharacter scene={scene} state={state} look={look} pulse={pulse} />
        )}
        <div className="mt-1 text-sm font-semibold text-ink-bright">{scene.who}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
          <span
            className="rounded-full px-2 py-0.5"
            style={{ background: "var(--surface3)", color: "var(--text-muted)" }}
          >
            {scene.emoji} {scene.name}
          </span>
          <span className="text-secondary">{status}</span>
        </div>
      </div>
    </div>
  );
}
