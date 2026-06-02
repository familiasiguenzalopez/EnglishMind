import { anonClient } from "@/lib/supabase/anon";
import { ChatSession } from "@/components/ChatSession";
import { getScene, sceneForLesson } from "@/lib/scenes";

// Página de sesión. Tres modos:
//  · ?escenario=<id>  → escena de la galería (práctica libre ambientada)
//  · ?leccion=<id>    → lección de una ruta (DB); la escena se infiere del contenido
//  · sin parámetros   → charla libre con el tutor
export const dynamic = "force-dynamic";

type LessonContent = {
  goal?: string;
  scenario?: string;
  starter?: string;
  scene?: string;
};

export default async function SesionPage({
  searchParams,
}: {
  searchParams: Promise<{ leccion?: string; escenario?: string }>;
}) {
  const { leccion, escenario } = await searchParams;

  // 1) Escena de la galería
  if (escenario) {
    const scene = getScene(escenario) ?? getScene("tutor")!;
    return (
      <ChatSession
        scene={scene}
        scenario={scene.scenario || undefined}
        starter={scene.starter}
        goal={scene.goal}
      />
    );
  }

  // 2) Lección de una ruta
  if (leccion) {
    const supabase = anonClient();
    const { data } = await supabase
      .from("lessons")
      .select("content")
      .eq("id", leccion)
      .single();
    const content = (data?.content ?? {}) as LessonContent;
    return (
      <ChatSession
        scene={sceneForLesson(content)}
        scenario={content.scenario}
        starter={content.starter}
        goal={content.goal}
        lessonId={leccion}
      />
    );
  }

  // 3) Charla libre
  return <ChatSession scene={getScene("tutor")!} />;
}
