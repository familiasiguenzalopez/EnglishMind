import Link from "next/link";
import { CefrBadge } from "@/components/ui/CefrBadge";
import { AuthStatus } from "@/components/AuthStatus";
import { anonClient } from "@/lib/supabase/anon";

// Home dashboard. El "plan de hoy" se arma con lecciones reales de Call center.
// (El progreso/nivel siguen de ejemplo hasta tener sesión/auth.)
export const dynamic = "force-dynamic";

type PlanItem = { id: string; title: string; ruta: string };

export default async function HomeDashboard() {
  const xp = 120;
  const xpMeta = 200;

  const supabase = anonClient();
  const { data } = await supabase
    .from("lessons")
    .select("id,title,sort_order,units!inner(routes!inner(slug,name))")
    .eq("units.routes.slug", "call-center")
    .order("sort_order")
    .limit(3);

  const plan: PlanItem[] = ((data ?? []) as any[]).map((l) => {
    // PostgREST devuelve la relación to-one como objeto; toleramos ambos.
    const unit = Array.isArray(l.units) ? l.units[0] : l.units;
    const route = Array.isArray(unit?.routes) ? unit.routes[0] : unit?.routes;
    return { id: l.id, title: l.title, ruta: route?.name ?? "Práctica" };
  });

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
      <div className="mb-4 flex justify-end">
        <AuthStatus />
      </div>

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

      <Link
        href="/ruta/call-center"
        className="mt-3 block rounded-lg border border-line bg-surface px-5 py-3 text-center text-sm font-semibold text-ink-bright transition hover:border-primary"
      >
        Tu ruta: Call center →
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/planes"
          className="rounded-lg border border-line bg-surface px-4 py-3 text-center text-sm font-semibold text-ink transition hover:border-primary"
        >
          💎 Planes
        </Link>
        <Link
          href="/marketplace"
          className="rounded-lg border border-line bg-surface px-4 py-3 text-center text-sm font-semibold text-ink transition hover:border-primary"
        >
          🛒 Marketplace
        </Link>
      </div>

      <Link
        href="/progreso"
        className="mt-3 block rounded-lg border border-line bg-surface px-5 py-3 text-center text-sm font-semibold text-ink transition hover:border-primary"
      >
        🎙️ Tu progreso, en tu propia voz →
      </Link>

      <h1 className="mt-8 font-display text-2xl font-extrabold text-ink-bright">
        Tu plan de hoy
      </h1>
      <p className="text-ink-muted">Sesiones cortas, una cosa a la vez.</p>

      <div className="mt-4 space-y-3">
        {plan.map((a) => (
          <Link
            key={a.id}
            href={`/sesion?leccion=${a.id}`}
            className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 transition hover:border-primary"
          >
            <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-surface3 text-xl">
              🎧
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">
                {a.ruta}
              </div>
              <div className="truncate font-semibold text-ink-bright">
                {a.title}
              </div>
              <div className="text-xs text-ink-muted">5 min · +20 XP</div>
            </div>
            <span className="text-ink-dim">›</span>
          </Link>
        ))}
        {plan.length === 0 && (
          <p className="text-sm text-ink-muted">
            Aún no hay lecciones disponibles.
          </p>
        )}
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
