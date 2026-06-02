import { anonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { TutorPicker } from "@/components/TutorPicker";
import { TutorPrefs } from "@/components/TutorPrefs";

export const dynamic = "force-dynamic";

type TutorRow = {
  id: string;
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
    .select("id,slug,name,role,accent,emoji")
    .order("sort_order");
  const tutors = (data ?? []) as TutorRow[];

  // Tutor activo del usuario logueado (para resaltarlo)
  let activeId: string | null = null;
  try {
    const ssr = await createServerClient();
    const {
      data: { user },
    } = await ssr.auth.getUser();
    if (user) {
      const { data: prof } = await ssr
        .from("profiles")
        .select("active_tutor_id")
        .eq("id", user.id)
        .single();
      activeId = (prof?.active_tutor_id as string | null) ?? null;
    }
  } catch {
    /* invitado */
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Elige tu tutor
      </h1>
      <p className="mt-2 text-ink-muted">
        Cada uno enseña algo distinto. Puedes cambiar cuando quieras
        {ruta ? (
          <>
            {" "}
            · ruta: <span className="text-ink">{ruta}</span>
          </>
        ) : null}
        .
      </p>

      <div className="mt-7">
        <TutorPicker tutors={tutors} initialActiveId={activeId} />
      </div>

      <TutorPrefs />
    </main>
  );
}
