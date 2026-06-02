// Loader (server) del camino de aprendizaje activo del usuario.
// Reúne: objetivo activo (profiles.goal) + lecciones completadas (progress) +
// la ruta del catálogo, y devuelve el LearningPath ya calculado.
// Solo para Server Components (usa cookies vía el cliente SSR).
import { anonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { buildPath, type LearningPath, type PathUnit } from "@/lib/path";

const DEFAULT_ROUTE = "call-center";
const SEL =
  "slug,name,description,units(id,title,cefr_target,can_do,sort_order,lessons(id,title,kind,sort_order))";

export type ActiveRoute = {
  slug: string;
  name: string;
  description: string | null;
  units: PathUnit[];
  path: LearningPath;
  userId: string | null;
};

export async function loadLearningPath(): Promise<ActiveRoute> {
  let goal: string | null = null;
  let userId: string | null = null;
  const completed = new Set<string>();

  try {
    const ssr = await createServerClient();
    const {
      data: { user },
    } = await ssr.auth.getUser();
    if (user) {
      userId = user.id;
      const { data: prof } = await ssr.from("profiles").select("goal").eq("id", user.id).single();
      goal = (prof?.goal as string | null) ?? null;
      const { data: prog } = await ssr
        .from("progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("status", "done");
      (prog ?? []).forEach((p: { lesson_id: string }) => completed.add(p.lesson_id));
    }
  } catch {
    /* invitado */
  }

  const sb = anonClient();
  const slug = goal || DEFAULT_ROUTE;
  let { data: route } = await sb.from("routes").select(SEL).eq("slug", slug).maybeSingle();
  if (!route) {
    ({ data: route } = await sb.from("routes").select(SEL).eq("slug", DEFAULT_ROUTE).maybeSingle());
  }
  const r = route as { slug: string; name: string; description: string | null; units: PathUnit[] } | null;
  const units = (r?.units ?? []) as PathUnit[];

  return {
    slug: r?.slug ?? DEFAULT_ROUTE,
    name: r?.name ?? "Aprende inglés",
    description: r?.description ?? null,
    units,
    path: buildPath(units, completed, !!userId),
    userId,
  };
}
