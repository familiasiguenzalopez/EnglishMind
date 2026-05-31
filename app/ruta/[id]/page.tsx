import Link from "next/link";
import { anonClient } from "@/lib/supabase/anon";
import { CefrBadge, type CefrLevel } from "@/components/ui/CefrBadge";

// Detalle de ruta: unidades (con su can-do) y lecciones de escenario.
export const dynamic = "force-dynamic";

type Lesson = { id: string; title: string; kind: string; sort_order: number };
type Unit = {
  id: string;
  title: string;
  cefr_target: string | null;
  can_do: string | null;
  sort_order: number;
  lessons: Lesson[];
};
type Route = { name: string; description: string | null; units: Unit[] };

export default async function RutaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const supabase = anonClient();
  const { data } = await supabase
    .from("routes")
    .select(
      "name,description,units(id,title,cefr_target,can_do,sort_order,lessons(id,title,kind,sort_order))",
    )
    .eq("slug", slug)
    .single();

  const route = data as Route | null;
  const units = (route?.units ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
      <Link
        href="/onboarding"
        className="text-sm text-ink-muted hover:text-ink"
      >
        ‹ Cambiar objetivo
      </Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-bright">
        {route?.name ?? "Ruta"}
      </h1>
      {route?.description && (
        <p className="mt-1 text-ink-muted">{route.description}</p>
      )}

      <div className="mt-6 space-y-5">
        {units.map((u) => (
          <section
            key={u.id}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-2">
              {u.cefr_target && (
                <CefrBadge level={u.cefr_target as CefrLevel} />
              )}
              <h2 className="font-display font-bold text-ink-bright">
                {u.title}
              </h2>
            </div>
            {u.can_do && (
              <p className="mt-1 text-xs text-secondary">✓ {u.can_do}</p>
            )}
            <div className="mt-3 space-y-2">
              {u.lessons
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((l) => (
                  <Link
                    key={l.id}
                    href={`/sesion?leccion=${l.id}`}
                    className="flex items-center justify-between rounded-md border border-line bg-surface2 px-3 py-2.5 text-sm transition hover:border-primary"
                  >
                    <span className="text-ink">{l.title}</span>
                    <span className="text-ink-dim">Practicar ›</span>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>

      {units.length === 0 && (
        <p className="mt-6 text-sm text-warning">
          Esta ruta aún no tiene lecciones.
        </p>
      )}
    </main>
  );
}
