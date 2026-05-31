import { microcopy } from "@/lib/microcopy";

function StateCard({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6 text-center">
      <div className="mb-2 text-3xl">{emoji}</div>
      <p className="font-display text-lg font-bold text-ink-bright">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </div>
  );
}

/** Estados con copy que tranquiliza (Sección 06 / 09). */
export function OfflineState() {
  return <StateCard emoji="📴" title="Sin conexión" body={microcopy.offline} />;
}

export function EmptyState() {
  return (
    <StateCard emoji="🌱" title="Todo listo para empezar" body={microcopy.empty} />
  );
}

export function LoadingState() {
  return (
    <StateCard
      emoji="⏳"
      title="Un momento…"
      body="Preparando todo con calma."
    />
  );
}
