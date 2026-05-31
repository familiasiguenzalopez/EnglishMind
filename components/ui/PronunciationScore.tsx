import { cn } from "@/lib/cn";
import { microcopy } from "@/lib/microcopy";

export type PronStatus = "correct" | "improve" | "unintelligible";

const styleByStatus: Record<
  PronStatus,
  { bar: string; text: string; label: string }
> = {
  correct: {
    bar: "bg-success",
    text: "text-success",
    label: microcopy.pronunciation.correct,
  },
  improve: {
    bar: "bg-warning",
    text: "text-warning",
    label: microcopy.pronunciation.improve,
  },
  unintelligible: {
    bar: "bg-danger",
    text: "text-danger",
    label: microcopy.pronunciation.unintelligible,
  },
};

/**
 * Score de pronunciación con escala de 3 niveles.
 * correcto (teal) · por mejorar (ámbar cálido) · no se entendió (rojo, solo si
 * es ininteligible). El error informa, no castiga.
 */
export function PronunciationScore({
  status,
  value,
}: {
  status: PronStatus;
  value: number;
}) {
  const s = styleByStatus[status];
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="rounded-md border border-line bg-surface2 p-3">
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface3">
        <div
          className={cn("h-full rounded-full transition-all", s.bar)}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className={cn("text-sm font-semibold", s.text)}>{s.label}</p>
    </div>
  );
}
