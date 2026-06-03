"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GALLERY } from "@/lib/scenes";

// "Laboratorio de roleplays" estilo ELSA: un escenario al azar, o crea el tuyo
// describiendo la situación (va a /sesion?tema=... como role-play a tu medida).
export function ScenarioExtras() {
  const router = useRouter();
  const [tema, setTema] = useState("");

  function surprise() {
    const pool = GALLERY.filter((s) => s.id !== "tutor");
    const s = pool[Math.floor(Math.random() * pool.length)];
    if (s) router.push(`/sesion?escenario=${s.id}`);
  }
  function create() {
    const t = tema.trim();
    if (t) router.push(`/sesion?tema=${encodeURIComponent(t)}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={surprise}
        className="flex items-center gap-3 rounded-2xl border border-secondary bg-surface2 p-4 text-left transition hover:border-primary"
      >
        <span className="text-2xl">🎲</span>
        <span>
          <span className="block font-semibold text-ink-bright">Sorpréndeme</span>
          <span className="text-xs text-ink-muted">Un escenario al azar</span>
        </span>
      </button>

      <div className="rounded-2xl border border-line bg-surface2 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-semibold text-ink-bright">Crea tu propio</span>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                create();
              }
            }}
            placeholder="Ej: pedir comida a domicilio"
            className="flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={create}
            disabled={!tema.trim()}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
          >
            Ir
          </button>
        </div>
      </div>
    </div>
  );
}
