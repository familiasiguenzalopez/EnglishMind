"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type Tutor = {
  name: string;
  role: string;
  accent: string;
  emoji?: string;
};

/** Card de tutor: avatar + nombre + ROL pedagógico + acento + "Escuchar". */
export function TutorCard({
  tutor,
  active = false,
}: {
  tutor: Tutor;
  active?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-4 transition",
        active ? "border-primary" : "border-line hover:border-primary/60",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-surface3 text-2xl">
          {tutor.emoji ?? "🧑‍🏫"}
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-ink-bright">
            {tutor.name}
          </p>
          <p className="truncate text-xs text-ink-muted">{tutor.role}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-muted">
          {tutor.accent}
        </span>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-md bg-surface2 px-3 py-1.5 text-xs font-semibold text-ink transition hover:text-ink-bright"
        >
          {playing ? "⏸ Reproduciendo" : "▶ Escuchar"}
        </button>
      </div>
    </div>
  );
}
