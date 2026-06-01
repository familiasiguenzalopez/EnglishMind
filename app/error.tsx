"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-md px-5 py-20 text-center">
      <div className="text-4xl">🌧️</div>
      <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-bright">
        Algo se complicó
      </h1>
      <p className="mt-1 text-ink-muted">No fue tu culpa. Probemos de nuevo.</p>
      <div className="mt-5 flex justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
        >
          Reintentar
        </button>
        <Link
          href="/home"
          className="rounded-md border border-line px-5 py-2.5 text-sm text-ink"
        >
          Inicio
        </Link>
      </div>
    </main>
  );
}
