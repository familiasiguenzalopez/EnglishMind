import Link from "next/link";
import { CefrBadge, CEFR_LEVELS } from "@/components/ui/CefrBadge";
import { RehearsalToggle } from "@/components/ui/RehearsalToggle";
import { PronunciationScore } from "@/components/ui/PronunciationScore";
import { TutorCard } from "@/components/ui/TutorCard";
import { OfflineState, EmptyState } from "@/components/ui/states";

// Galería interna del design system (referencia). La app real entra por "/".
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DesignGallery() {
  return (
    <main className="mx-auto max-w-4xl px-5 pt-10 pb-28">
      <Link href="/" className="text-sm text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>
      <header className="mt-2 mb-6 flex flex-wrap items-center gap-3">
        <span
          className="h-3.5 w-3.5 rounded-[4px]"
          style={{
            background:
              "linear-gradient(135deg,var(--color-primary),var(--color-secondary))",
          }}
        />
        <h1 className="font-display text-2xl font-extrabold text-ink-bright">
          Design system
        </h1>
      </header>
      <p className="mb-10 max-w-prose text-ink-muted">
        Componentes pedagógicos núcleo. Cada decisión sirve a la Sección 00: el
        error informa, no castiga.
      </p>

      <Section title="Niveles CEFR">
        <div className="flex flex-wrap gap-2">
          {CEFR_LEVELS.map((l) => (
            <CefrBadge key={l} level={l} />
          ))}
        </div>
      </Section>

      <Section title="Score de pronunciación (3 niveles)">
        <div className="grid gap-3 sm:grid-cols-3">
          <PronunciationScore status="correct" value={92} />
          <PronunciationScore status="improve" value={58} />
          <PronunciationScore status="unintelligible" value={24} />
        </div>
      </Section>

      <Section title="Modo ensayo">
        <RehearsalToggle />
      </Section>

      <Section title="Tutores">
        <div className="grid gap-3 sm:grid-cols-2">
          <TutorCard
            active
            tutor={{
              name: "Sofía",
              role: "Conversación y confianza para hablar",
              accent: "🌎 Latino neutro",
              emoji: "💬",
            }}
          />
          <TutorCard
            tutor={{
              name: "Marcus",
              role: "Pronunciación y fonética",
              accent: "🇺🇸 EE. UU.",
              emoji: "🗣️",
            }}
          />
        </div>
      </Section>

      <Section title="Estados que tranquilizan">
        <div className="grid gap-3 sm:grid-cols-2">
          <OfflineState />
          <EmptyState />
        </div>
      </Section>
    </main>
  );
}
