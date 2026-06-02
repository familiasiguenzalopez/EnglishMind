import { PlacementForm } from "@/components/PlacementForm";

// "Para conocerte" — placement con calma (nunca examen). Fija el nivel inicial.
export const dynamic = "force-dynamic";

export default async function Placement({
  searchParams,
}: {
  searchParams: Promise<{ ruta?: string }>;
}) {
  const { ruta } = await searchParams;

  return (
    <main className="mx-auto max-w-xl px-5 pt-12 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Para conocerte
      </h1>
      <p className="mt-2 text-ink-muted">
        Esto <strong>no es un examen</strong>. Escribe (o dicta) unas líneas en
        inglés sobre ti o tu trabajo — solo para ubicar tu punto de partida.
        Equivocarte está perfecto.
      </p>

      <div className="mt-6">
        <PlacementForm ruta={ruta ?? null} />
      </div>
    </main>
  );
}
