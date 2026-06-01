import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-5 py-20 text-center">
      <div className="text-4xl">🧭</div>
      <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-bright">
        No encontramos esta página
      </h1>
      <p className="mt-1 text-ink-muted">
        No te preocupes — volvamos a tu camino.
      </p>
      <Link
        href="/home"
        className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
      >
        Ir al inicio
      </Link>
    </main>
  );
}
