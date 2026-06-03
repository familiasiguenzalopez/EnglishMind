"use client";

// Radar (pentágono) de destrezas — estilo "Tu dominio" de ELSA, con tu marca.
// values: 5 ejes con valor 0-100.
export function SkillRadar({ values }: { values: { label: string; value: number }[] }) {
  const N = values.length || 5;
  const cx = 100;
  const cy = 100;
  const R = 68;
  const pt = (i: number, frac: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    return [cx + Math.cos(a) * R * frac, cy + Math.sin(a) * R * frac];
  };
  const ring = (frac: number) => values.map((_, i) => pt(i, frac).map((n) => n.toFixed(1)).join(",")).join(" ");
  const data = values
    .map((v, i) => pt(i, Math.max(0.05, Math.min(1, v.value / 100))).map((n) => n.toFixed(1)).join(","))
    .join(" ");

  return (
    <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[260px]" role="img" aria-label="Radar de destrezas">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}
      <polygon points={data} fill="rgba(39,224,196,0.22)" stroke="var(--color-secondary)" strokeWidth="2" />
      {values.map((v, i) => {
        const [x, y] = pt(i, Math.max(0.05, Math.min(1, v.value / 100)));
        return <circle key={i} cx={x} cy={y} r="2.6" fill="var(--color-secondary)" />;
      })}
      {values.map((v, i) => {
        const [x, y] = pt(i, 1.2);
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize="8.5"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-muted)"
          >
            {v.label}
          </text>
        );
      })}
    </svg>
  );
}
