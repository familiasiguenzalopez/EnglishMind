import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import { XpStreak } from "@/components/XpStreak";
import { loadLearningPath } from "@/lib/loadPath";
import { lessonHref } from "@/lib/path";

// Home = hub metodológico: retoma el camino (continuar donde quedaste, con la
// meta can-do actual), y debajo las prácticas y el resto. La barra inferior
// organiza el loop pedagógico: Aprender → Practicar → Repasar → Progreso.
export const dynamic = "force-dynamic";

const PRACTICE = [
  { href: "/escenarios", icon: "🎬", label: "Escenarios", sub: "Conversa en situaciones reales" },
  { href: "/pronunciacion", icon: "🗣️", label: "Pronunciación", sub: "Afina tu acento" },
  { href: "/escritura", icon: "✍️", label: "Escritura", sub: "Mejora tus textos" },
  { href: "/repaso", icon: "🔁", label: "Repaso", sub: "Fija lo aprendido" },
];

const MORE = [
  { href: "/progreso", icon: "🎙️", label: "Tu progreso" },
  { href: "/certificado", icon: "🎓", label: "Certificado CEFR" },
  { href: "/planes", icon: "💎", label: "Planes" },
  { href: "/marketplace", icon: "🛒", label: "Marketplace" },
];

export default async function HomeDashboard() {
  const { name, path } = await loadLearningPath();
  const pct = path.totalLessons ? Math.round((path.doneLessons / path.totalLessons) * 100) : 0;
  const currentUnit = path.units.find((u) => u.nodes.some((n) => n.state === "current"));
  const meta = currentUnit?.can_do ?? null;

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
      <div className="mb-4 flex justify-end">
        <AuthStatus />
      </div>

      <XpStreak />

      <Link
        href="/onboarding"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-secondary bg-surface2 px-4 py-2.5 text-sm font-semibold text-ink-bright transition hover:border-primary"
      >
        ✨ Personaliza tu experiencia (tutor, objetivo y avatar)
      </Link>

      {/* Retoma tu camino (lo metodológico primero) */}
      <section className="mt-6 rounded-lg border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">Tu camino</div>
          <Link href="/aprender" className="text-xs text-ink-dim hover:text-ink">
            Ver todo ›
          </Link>
        </div>
        <div className="mt-0.5 font-display text-xl font-extrabold text-ink-bright">{name}</div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>
              {path.doneLessons} de {path.totalLessons} lecciones
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface3">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg,var(--color-primary),var(--color-secondary))",
              }}
            />
          </div>
        </div>

        {meta && (
          <p className="mt-3 flex items-start gap-1.5 rounded-md border border-line bg-surface2 px-3 py-2 text-xs">
            <span>🎯</span>
            <span>
              <span className="font-bold uppercase tracking-wide text-secondary">Tu meta ahora · </span>
              <span className="text-ink">{meta}</span>
            </span>
          </p>
        )}

        {path.next ? (
          <Link
            href={lessonHref(path.next.kind, path.next.id)}
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
        ) : (
          <Link
            href="/aprender"
            className="mt-4 flex items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            <span>Empezar a aprender</span>
            <span>▶</span>
          </Link>
        )}
      </section>

      {/* Práctica (las destrezas, como actividades — no como la espina) */}
      <h2 className="mt-8 font-display text-lg font-extrabold text-ink-bright">Practica</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {PRACTICE.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="rounded-lg border border-line bg-surface p-4 transition hover:border-primary"
          >
            <div className="text-2xl">{p.icon}</div>
            <div className="mt-1.5 font-semibold text-ink-bright">{p.label}</div>
            <div className="text-xs text-ink-muted">{p.sub}</div>
          </Link>
        ))}
      </div>

      {/* Más */}
      <h2 className="mt-8 font-display text-lg font-extrabold text-ink-bright">Más</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {MORE.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:border-primary"
          >
            <span className="text-lg">{m.icon}</span>
            {m.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <Link href="/admin" className="text-xs text-ink-dim transition hover:text-ink">
          ⚙️ Administrador
        </Link>
        <Link href="/org" className="text-xs text-ink-dim transition hover:text-ink">
          🏫 Colegios y empresas
        </Link>
      </div>
    </main>
  );
}
