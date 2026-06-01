import Link from "next/link";
import { anonClient } from "@/lib/supabase/anon";
import { planBullets } from "@/lib/planFeatures";

export const dynamic = "force-dynamic";

type Plan = {
  code: string;
  name: string;
  audience: string;
  price_month: number;
  annual_discount: number;
  trial_days: number;
  ai_tier: string;
  features: Record<string, unknown>;
};

function annual(p: Plan) {
  return (p.price_month * (1 - p.annual_discount / 100)).toFixed(2);
}

function PlanCard({ p, perAlumno }: { p: Plan; perAlumno?: boolean }) {
  const star = p.code === "pro";
  const bullets = planBullets(p.features);
  return (
    <div
      className={
        "relative rounded-lg border bg-surface p-5 " +
        (star ? "border-primary" : "border-line")
      }
    >
      {star && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
          Estrella
        </span>
      )}
      <div className="font-display text-lg font-bold text-ink-bright">
        {p.name}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-3xl font-extrabold text-ink-bright">
          ${p.price_month.toFixed(2)}
        </span>
        <span className="text-sm text-ink-muted">
          {perAlumno ? "/alumno" : "/mes"}
        </span>
      </div>
      {p.annual_discount > 0 ? (
        <div className="text-xs text-secondary">
          ${annual(p)}/mes pagando anual (−{p.annual_discount}%)
        </div>
      ) : (
        <div className="text-xs text-ink-dim">Sin descuento anual</div>
      )}
      <span className="mt-2 inline-block rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-muted">
        IA {p.ai_tier}
      </span>
      <ul className="mt-3 space-y-1.5">
        {bullets.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink">
            <span className="text-secondary">›</span>
            {t}
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={
          "mt-4 block rounded-md px-4 py-2 text-center text-sm font-bold transition " +
          (star
            ? "bg-primary text-white hover:bg-primary-dim"
            : "border border-line text-ink-bright hover:border-primary")
        }
      >
        {p.price_month === 0 ? "Empezar gratis" : "Elegir"}
      </Link>
    </div>
  );
}

export default async function Planes() {
  const supabase = anonClient();
  const { data } = await supabase
    .from("plans")
    .select(
      "code,name,audience,price_month,annual_discount,trial_days,ai_tier,features",
    )
    .order("price_month");
  const plans = (data ?? []) as Plan[];
  const personal = plans
    .filter((p) => p.audience === "personal")
    .sort((a, b) => a.price_month - b.price_month);
  const colegio = plans
    .filter((p) => p.audience === "colegio")
    .sort((a, b) => b.price_month - a.price_month);

  return (
    <main className="mx-auto max-w-5xl px-5 pt-10 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Planes
      </h1>
      <p className="mt-2 text-ink-muted">
        El inglés es movilidad social, no un lujo. Precios accesibles y anual con
        descuento.
      </p>

      <h2 className="mt-8 font-display text-lg font-bold text-ink-bright">
        Para ti
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {personal.map((p) => (
          <PlanCard key={p.code} p={p} />
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-ink-bright">
        Para colegios
      </h2>
      <p className="text-sm text-ink-muted">
        Precio por alumno-mes, facturado anual. Medir sin vigilar.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {colegio.map((p) => (
          <PlanCard key={p.code} p={p} perAlumno />
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-dim">
        Precios indicativos a validar. La activación llega con el sistema de pagos
        (tarjeta, Transfer365, “Pay” del BCR).
      </p>
    </main>
  );
}
