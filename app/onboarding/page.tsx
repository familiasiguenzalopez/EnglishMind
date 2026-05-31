import Link from "next/link";
import { anonClient } from "@/lib/supabase/anon";

// Pantalla 0 — pregunta el PORQUÉ (motivación = utilidad percibida) y baja
// la ansiedad antes de cualquier prueba. Lee las rutas reales de Supabase.
export const dynamic = "force-dynamic";

const ROUTE_EMOJI: Record<string, string> = {
  "call-center": "🎧",
  "trabajo-remoto": "💻",
  entrevista: "💼",
  migracion: "🧭",
  cotidiano: "🌎",
  certificacion: "📜",
};

type Route = { slug: string; name: string; description: string | null };

export default async function Onboarding() {
  const supabase = anonClient();
  const { data } = await supabase
    .from("routes")
    .select("slug,name,description")
    .order("sort_order");
  const routes = (data ?? []) as Route[];

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <header className="mb-8 flex items-center gap-3">
        <span
          className="h-3.5 w-3.5 rounded-[4px]"
          style={{
            background:
              "linear-gradient(135deg,var(--color-primary),var(--color-secondary))",
          }}
        />
        <span className="font-display text-lg font-extrabold text-ink-bright">
          EnglishMind AI
        </span>
      </header>

      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        ¿Por qué aprendes inglés?
      </h1>
      <p className="mt-2 text-ink-muted">
        No necesitas saber nada todavía. Vamos a tu ritmo — elige lo que más te
        importa ahora.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {routes.map((r) => (
          <Link
            key={r.slug}
            href={`/tutores?ruta=${r.slug}`}
            className="rounded-lg border border-line bg-surface p-4 transition hover:border-primary"
          >
            <div className="text-2xl">{ROUTE_EMOJI[r.slug] ?? "✨"}</div>
            <div className="mt-2 font-display font-bold text-ink-bright">
              {r.name}
            </div>
            {r.description && (
              <div className="mt-0.5 text-xs text-ink-muted">
                {r.description}
              </div>
            )}
          </Link>
        ))}
      </div>

      {routes.length === 0 && (
        <p className="mt-6 text-sm text-warning">
          No se cargaron las rutas. ¿Aplicaste la migración del catálogo público?
        </p>
      )}

      <p className="mt-7 text-xs text-ink-dim">
        Después haremos un repaso breve solo para conocerte — nunca es un examen.
      </p>
    </main>
  );
}
