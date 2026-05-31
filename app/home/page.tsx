import Link from "next/link";
import { CefrBadge } from "@/components/ui/CefrBadge";

// Home dashboard (esqueleto). Datos de ejemplo; se conectarán al progreso real
// del usuario cuando exista la sesión/auth (Fase 1 siguiente).
const PLAN = [
  { uso: "Call center", titulo: "Saludo y apertura de llamada", min: 5, xp: 20, emoji: "🎧" },
  { uso: "Pronunciación", titulo: "Pares mínimos: ship / sheep", min: 4, xp: 15, emoji: "🗣️" },
  { uso: "Escritura", titulo: "Responder un correo al supervisor", min: 6, xp: 25, emoji: "✍️" },
];

export default function HomeDashboard() {
  const xp = 120;
  const xpMeta = 200;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CefrBadge level="A2" />
          <span className="text-sm text-ink-muted">Tu nivel</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-ink">🔥 3 días</span>
          <span className="text-ink-muted">{xp} XP</span>
        </div>
      </header>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface3">
        <div
          className="h-full rounded-full bg-secondary"
          style={{ width: `${Math.round((xp / xpMeta) * 100)}%` }}
        />
      </div>

      <Link
        href="/sesion"
        className="mt-6 block rounded-lg bg-primary px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-primary-dim"
      >
        Practicar con tu tutor →
      </Link>

      <h1 className="mt-8 font-display text-2xl font-extrabold text-ink-bright">
        Tu plan de hoy
      </h1>
      <p className="text-ink-muted">Sesiones cortas, una cosa a la vez.</p>

      <div className="mt-4 space-y-3">
        {PLAN.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4"
          >
            <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-surface3 text-xl">
              {a.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">
                {a.uso}
              </div>
              <div className="truncate font-semibold text-ink-bright">
                {a.titulo}
              </div>
              <div className="text-xs text-ink-muted">
                {a.min} min · +{a.xp} XP
              </div>
            </div>
            <span className="text-ink-dim">›</span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface2 p-4">
        <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">
          Ya puedes…
        </div>
        <p className="mt-0.5 text-ink-bright">
          Saludar y presentarte en una llamada en inglés.
        </p>
      </div>
    </main>
  );
}
