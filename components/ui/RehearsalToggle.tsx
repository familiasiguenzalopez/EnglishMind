"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { microcopy } from "@/lib/microcopy";

/**
 * Toggle "Modo ensayo" — practicar sin que cuente.
 * Materializa la promesa "En confianza": reintentos sin penalización.
 */
export function RehearsalToggle({
  defaultOn = false,
  onChange,
}: {
  defaultOn?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const [on, setOn] = useState(defaultOn);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        const next = !on;
        setOn(next);
        onChange?.(next);
      }}
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition",
        on
          ? "border-secondary bg-secondary/10 text-ink-bright"
          : "border-line bg-surface2 text-ink-muted",
      )}
    >
      <span
        className={cn(
          "relative h-5 w-9 flex-none rounded-full border transition",
          on ? "border-secondary bg-secondary" : "border-line bg-surface3",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all",
            on ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
      <span>{microcopy.rehearsal}</span>
    </button>
  );
}
