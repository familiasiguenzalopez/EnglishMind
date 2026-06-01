import Link from "next/link";

// Landing pública (entrada de la app). Sin BottomNav (oculta en "/").
const CHIPS = [
  { icon: "🗣️", t: "Habla sin miedo", d: "Modo ensayo y reintentos sin que cuente." },
  { icon: "🎧", t: "Inglés con propósito", d: "Call center, entrevista, migración, trabajo remoto." },
  { icon: "🧠", t: "Tutores con IA", d: "Conversas y te corrigen con cariño, no con regaños." },
  { icon: "📜", t: "Certificado verificable", d: "Muestra tu nivel con un enlace público." },
];

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col px-5 py-10">
      <header className="flex items-center gap-2">
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

      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="font-display text-4xl font-extrabold leading-tight text-ink-bright">
          Aprende el inglés que <span className="text-primary">te abre puertas</span>.
        </h1>
        <p className="mt-3 max-w-prose text-ink-muted">
          Para el trabajo, la entrevista, el trámite. Conversación con IA sin
          ansiedad, pensada para El Salvador y Latinoamérica. A tu ritmo, en tu
          teléfono.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            Empezar — es gratis
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-line px-6 py-3 text-sm font-semibold text-ink-bright transition hover:border-primary"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {CHIPS.map((c) => (
            <div key={c.t} className="rounded-lg border border-line bg-surface p-4">
              <div className="text-2xl">{c.icon}</div>
              <div className="mt-1 font-display font-bold text-ink-bright">
                {c.t}
              </div>
              <div className="text-xs text-ink-muted">{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-line pt-4 text-xs text-ink-dim">
        <span>Hecho para El Salvador &amp; LATAM</span>
        <span className="flex gap-3">
          <Link href="/planes" className="hover:text-ink">
            Planes
          </Link>
          <Link href="/design" className="hover:text-ink">
            Design system
          </Link>
        </span>
      </footer>
    </main>
  );
}
