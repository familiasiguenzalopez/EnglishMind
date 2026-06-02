"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { award } from "@/lib/gamify";

// Barra de "lección del camino" para las actividades de destreza
// (pronunciación / escritura). Muestra el objetivo y permite completar la
// lección: registra progreso (si hay sesión) + XP y ofrece volver al camino.
export function LessonBar({
  lessonId,
  goal,
  ready = true,
  xp = 20,
}: {
  lessonId?: string | null;
  goal?: string | null;
  ready?: boolean;
  xp?: number;
}) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!lessonId) return null;

  async function mark() {
    if (done || busy) return;
    setBusy(true);
    try {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
        await sb.from("progress").upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            status: "done",
            xp,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" },
        );
      }
      await award(xp, { id: "lesson-done", label: "Completaste una lección" });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-secondary bg-surface2 p-4">
      <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">
        🛤️ Lección del camino
      </div>
      {goal && <p className="mt-0.5 text-sm text-ink">{goal}</p>}

      {done ? (
        <Link
          href="/aprender"
          className="mt-3 flex items-center justify-between rounded-md bg-secondary px-4 py-2.5 text-sm font-bold text-bg"
        >
          <span>✓ ¡Lección completada! Volver al camino</span>
          <span>→</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={mark}
          disabled={busy || !ready}
          className="mt-3 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
          title={ready ? undefined : "Practica primero"}
        >
          {busy ? "Guardando…" : ready ? "Marcar como completada" : "Practica y luego complétala"}
        </button>
      )}
    </div>
  );
}
