import { anonClient } from "@/lib/supabase/anon";
import { ChatSession } from "@/components/ChatSession";

// Página de sesión. Si trae ?leccion=<id>, carga el escenario de esa lección
// para que el tutor haga role-play. Sin lección, es chat libre.
export const dynamic = "force-dynamic";

type LessonContent = { goal?: string; scenario?: string; starter?: string };

export default async function SesionPage({
  searchParams,
}: {
  searchParams: Promise<{ leccion?: string }>;
}) {
  const { leccion } = await searchParams;

  let content: LessonContent = {};
  if (leccion) {
    const supabase = anonClient();
    const { data } = await supabase
      .from("lessons")
      .select("content")
      .eq("id", leccion)
      .single();
    content = (data?.content ?? {}) as LessonContent;
  }

  return (
    <ChatSession
      scenario={content.scenario}
      starter={content.starter}
      goal={content.goal}
    />
  );
}
