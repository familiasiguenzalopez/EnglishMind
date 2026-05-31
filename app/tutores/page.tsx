import Link from "next/link";
import { anonClient } from "@/lib/supabase/anon";
import { TutorCard } from "@/components/ui/TutorCard";

// Selección de tutor — lee los 6 tutores reales de Supabase.
export const dynamic = "force-dynamic";

type TutorRow = {
  slug: string;
  name: string;
  role: string;
  accent: string | null;
  emoji: string | null;
};

export default async function Tutores({
  searchParams,
}: {
  searchParams: Promise<{ ruta?: string }>;
}) {
  const { ruta } = await searchParams;
  const supabase = anonClient();
  const { data } = await supabase
    .from("tutors")
    .select("slug,name,role,accent,emoji")
    .order("sort_order");
  const tutors = (data ?? []) as TutorRow[];

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Elige tu tutor
      </h1>
      <p className="mt-2 text-ink-muted">
        Cada uno enseña algo distinto. Puedes cambiar cuando quieras
        {ruta ? <> · ruta: <span className="text-ink">{ruta}</span></> : null}.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {tutors.map((t, i) => (
          <TutorCard
            key={t.slug}
            active={i === 0}
            tutor={{
              name: t.name,
              role: t.role,
              accent: t.accent ?? "",
              emoji: t.emoji ?? undefined,
            }}
          />
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/home"
          className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
        >
          Continuar
        </Link>
      </div>
    </main>
  );
}
