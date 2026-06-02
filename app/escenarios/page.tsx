import Link from "next/link";
import { GALLERY } from "@/lib/scenes";
import { AvatarPicker } from "@/components/scene/AvatarPicker";
import { SceneBackground } from "@/components/scene/SceneBackground";

// Galería de escenarios inmersivos. Cada tarjeta inicia una práctica libre
// ambientada (/sesion?escenario=<id>). Arriba, personalización del personaje.
export const metadata = { title: "Escenarios · EnglishMind" };

export default function EscenariosPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">Escenarios</h1>
      <p className="mt-2 text-ink-muted">
        Practica inglés en situaciones reales. Elige una escena y empieza a hablar — tu personaje te acompaña.
      </p>

      <div className="mt-6">
        <AvatarPicker />
      </div>

      <h2 className="mt-8 font-display text-xl font-extrabold text-ink-bright">Elige una escena</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GALLERY.map((s) => (
          <Link
            key={s.id}
            href={`/sesion?escenario=${s.id}`}
            className="group relative overflow-hidden rounded-lg border border-line bg-surface transition hover:border-primary"
          >
            <div className="relative h-20">
              <SceneBackground scene={s} />
              <div
                className="absolute bottom-1 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: "var(--surface3)", color: "var(--text-muted)" }}
              >
                {s.level}
              </div>
            </div>
            <div className="relative -mt-6 px-3 pb-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-full text-xl"
                style={{ background: "var(--surface3)", border: `2px solid ${s.ring}` }}
              >
                {s.emoji}
              </div>
              <div className="mt-1 font-semibold text-ink-bright">{s.name}</div>
              <div className="text-xs text-ink-muted">{s.blurb}</div>
              <div className="mt-1.5 text-[11px] font-bold text-secondary group-hover:text-primary">Empezar ›</div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-ink-dim">
        ¿Quieres un plan guiado por niveles? Mira{" "}
        <Link href="/onboarding" className="text-secondary hover:text-ink">
          tus rutas
        </Link>
        .
      </p>
    </main>
  );
}
