import Link from "next/link";
import { XpStreak } from "@/components/XpStreak";
import { CefrBadge, type CefrLevel } from "@/components/ui/CefrBadge";
import { cefrRange, lessonIcon } from "@/lib/path";
import { loadLearningPath } from "@/lib/loadPath";

// Camino de aprendizaje (la "columna" metodológica). Muestra la ruta activa
// como un journey por niveles: unidades = metas CEFR (can-do), lecciones =
// nodos con progresión (hecho / actual / disponible / bloqueado).
export const dynamic = "force-dynamic";

const ROUTE_EMOJI: Record<string, string> = {
  "call-center": "🎧",
  "trabajo-remoto": "💻",
  entrevista: "💼",
  migracion: "🧭",
  cotidiano: "🌎",
  certificacion: "📜",
};

export default async function Aprender() {
  const { slug, name, description, units, path } = await loadLearningPath();
  const range = cefrRange(units);
  const pct = path.totalLessons ? Math.round((path.doneLessons / path.totalLessons) * 100) : 0;
  const emoji = ROUTE_EMOJI[slug] ?? "✨";

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
      <XpStreak />

      {/* Cabecera de la ruta */}
      <section className="mt-5 rounded-lg border border-line bg-surface p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-surface3 text-2xl">
            {emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">
              Tu camino {range ? `· ${range}` : ""}
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-bright">{name}</h1>
            {description && <p className="text-sm text-ink-muted">{description}</p>}
          </div>
        </div>

        {/* Progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>
              {path.doneLessons} de {path.totalLessons} lecciones
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface3">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg,var(--color-primary),var(--color-secondary))",
              }}
            />
          </div>
        </div>

        {/* Continuar */}
        {path.next ? (
          <Link
            href={`/sesion?leccion=${path.next.id}`}
            className="mt-4 flex items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            <span>
              {path.doneLessons > 0 ? "Continuar" : "Empezar"}: {path.next.title}
            </span>
            <span>▶</span>
          </Link>
        ) : path.complete ? (
          <Link
            href="/repaso"
            className="mt-4 flex items-center justify-between rounded-md border border-secondary px-4 py-3 text-sm font-bold text-secondary"
          >
            <span>🎉 ¡Ruta completa! Refuerza con un repaso</span>
            <span>›</span>
          </Link>
        ) : null}

        <Link href="/onboarding" className="mt-3 block text-center text-xs text-ink-dim hover:text-ink">
          Cambiar objetivo
        </Link>
      </section>

      {/* El camino: unidades = metas CEFR, lecciones = nodos */}
      <div className="mt-7 space-y-6">
        {path.units.map((u) => (
          <section key={u.id}>
            <div className="flex items-center gap-2">
              {u.cefr_target && <CefrBadge level={u.cefr_target as CefrLevel} />}
              <h2 className="font-display font-bold text-ink-bright">{u.title}</h2>
              <span className="ml-auto text-xs text-ink-dim">
                {u.doneCount}/{u.nodes.length}
              </span>
            </div>
            {u.can_do && (
              <p className="mt-1 flex items-start gap-1.5 text-xs text-secondary">
                <span>🎯</span>
                <span>{u.can_do}</span>
              </p>
            )}

            {/* Nodos con riel vertical */}
            <ol className="mt-3 space-y-2 border-l-2 border-line pl-4">
              {u.nodes.map((n) => {
                const marker =
                  n.state === "done" ? "✓" : n.state === "locked" ? "🔒" : lessonIcon(n.kind);
                const inner = (
                  <div
                    className={
                      "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition " +
                      (n.state === "current"
                        ? "border-primary bg-surface2"
                        : n.state === "locked"
                          ? "border-line bg-surface opacity-55"
                          : "border-line bg-surface2 hover:border-primary")
                    }
                  >
                    <span
                      className={
                        "grid h-7 w-7 flex-none place-items-center rounded-full text-sm " +
                        (n.state === "done"
                          ? "bg-secondary text-bg"
                          : n.state === "current"
                            ? "bg-primary text-white"
                            : "bg-surface3 text-ink")
                      }
                    >
                      {marker}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ink-bright">{n.title}</span>
                      {n.state === "current" && (
                        <span className="text-[11px] font-bold uppercase tracking-wide text-primary">
                          Aquí vas
                        </span>
                      )}
                    </span>
                    <span className="flex-none text-xs text-ink-dim">
                      {n.state === "done"
                        ? "Repasar ›"
                        : n.state === "locked"
                          ? "Bloqueado"
                          : n.state === "current"
                            ? "Empezar ›"
                            : "Practicar ›"}
                    </span>
                  </div>
                );
                return (
                  <li key={n.id} className="-ml-[1.45rem] flex items-center gap-2">
                    <span
                      className={
                        "h-2.5 w-2.5 flex-none rounded-full " +
                        (n.state === "done"
                          ? "bg-secondary"
                          : n.state === "current"
                            ? "bg-primary"
                            : "bg-surface3")
                      }
                    />
                    <div className="min-w-0 flex-1">
                      {n.state === "locked" ? inner : <Link href={`/sesion?leccion=${n.id}`}>{inner}</Link>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        {path.totalLessons === 0 && (
          <p className="text-sm text-warning">Esta ruta aún no tiene lecciones.</p>
        )}
      </div>
    </main>
  );
}
