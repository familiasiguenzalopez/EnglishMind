import { cn } from "@/lib/cn";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

const bgByLevel: Record<CefrLevel, string> = {
  A1: "bg-cefr-a1",
  A2: "bg-cefr-a2",
  B1: "bg-cefr-b1",
  B2: "bg-cefr-b2",
  C1: "bg-cefr-c1",
  C2: "bg-cefr-c2",
};

/** Badge de nivel CEFR (A1..C2), un color distinto por nivel. */
export function CefrBadge({
  level,
  className,
}: {
  level: CefrLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-bg",
        bgByLevel[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
