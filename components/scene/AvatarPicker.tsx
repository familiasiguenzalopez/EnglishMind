"use client";

import { useEffect, useState } from "react";
import { LOOKS, loadLook, saveLook, type AvatarLook } from "@/lib/avatar";
import { getScene } from "@/lib/scenes";
import { SceneCharacter } from "./SceneCharacter";

// Personaliza el look del personaje 2D. Preview en vivo (habla) + guarda local.
export function AvatarPicker() {
  const [look, setLook] = useState<AvatarLook | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setLook(loadLook());
  }, []);

  const scene = getScene("tutor")!;
  if (!look) return null;

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="font-display font-bold text-ink-bright">Tu personaje</div>
      <p className="mt-1 text-xs text-ink-muted">Te acompaña en cada práctica. Elige su estilo.</p>

      <div className="mt-3 flex items-center gap-5">
        <SceneCharacter scene={scene} state="speaking" look={look} size={104} />
        <div className="flex flex-1 flex-wrap gap-2">
          {LOOKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setLook(l);
                saveLook(l.id);
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
              }}
              className={
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition " +
                (look.id === l.id
                  ? "border-primary bg-surface2 text-ink-bright"
                  : "border-line text-ink-muted hover:text-ink")
              }
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: l.skin, boxShadow: `inset 0 0 0 2px ${l.hair}` }} />
              {l.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 h-4 text-xs text-secondary">{saved ? "Guardado ✓" : ""}</div>
    </div>
  );
}
