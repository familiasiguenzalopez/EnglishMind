import Link from "next/link";
import { getScene, type Scene } from "@/lib/scenes";
import { AvatarPicker } from "@/components/scene/AvatarPicker";
import { SceneBackground } from "@/components/scene/SceneBackground";
import { ScenarioExtras } from "@/components/ScenarioExtras";

// Galería de escenarios inmersivos, organizada por categoría (estilo ELSA):
// laboratorio (sorpréndeme / crea el tuyo) + escenas agrupadas con nivel y duración.
export const metadata = { title: "Escenarios · EnglishMind" };

const CATS: { name: string; ids: string[] }[] = [
  { name: "Charla libre", ids: ["tutor"] },
  { name: "Vida diaria", ids: ["cafe", "restaurant", "shopping", "directions"] },
  { name: "Viajes", ids: ["airport", "hotel"] },
  { name: "Trabajo", ids: ["interview", "office", "call-center"] },
  { name: "Trámites y salud", ids: ["clerk", "doctor"] },
];

const DUR: Record<string, string> = {
  A1: "~4 min",
  A2: "~4 min",
  B1: "~5 min",
  B2: "~6 min",
  C1: "~7 min",
  C2: "~8 min",
};

function SceneCard({ s }: { s: Scene }) {
  return (
    <Link
      href={`/sesion?escenario=${s.id}`}
      className="group relative overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-primary"
    >
      <div className="relative h-20">
        <SceneBackground scene={s} />
        <span
          className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: "var(--surface3)", color: "var(--text-muted)" }}
        >
          {s.level} · {DUR[s.level] ?? "~5 min"}
        </span>
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
      </div>
    </Link>
  );
}

export default function EscenariosPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">Escenarios</h1>
      <p className="mt-2 text-ink-muted">
        Practica inglés en situaciones reales. Elige una escena y empieza a hablar — tu personaje te acompaña.
      </p>

      <div className="mt-5">
        <ScenarioExtras />
      </div>

      <div className="mt-6">
        <AvatarPicker />
      </div>

      {CATS.map((c) => {
        const scenes = c.ids.map((id) => getScene(id)).filter((s): s is Scene => !!s);
        if (!scenes.length) return null;
        return (
          <section key={c.name} className="mt-7">
            <h2 className="font-display text-lg font-extrabold text-ink-bright">{c.name}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {scenes.map((s) => (
                <SceneCard key={s.id} s={s} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-7 text-center text-xs text-ink-dim">
        ¿Quieres un plan guiado por niveles? Mira{" "}
        <Link href="/onboarding" className="text-secondary hover:text-ink">
          tus rutas
        </Link>
        .
      </p>
    </main>
  );
}
