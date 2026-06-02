"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { planBullets } from "@/lib/planFeatures";

type Plan = {
  id: string;
  code: string;
  name: string;
  audience: string;
  state: string;
  price_month: number;
  annual_discount: number;
  trial_days: number;
  ai_tier: string;
  features: Record<string, unknown>;
};

type Form = {
  id?: string;
  code: string;
  name: string;
  audience: "personal" | "colegio";
  state: "borrador" | "activo" | "archivado";
  price_month: number;
  annual_discount: number;
  trial_days: number;
  ai_tier: string;
  voz_min_dia: number; // 0 = ilimitada
  tutores6: boolean;
  rutas_todas: boolean;
  offline: boolean;
  cert: "no" | "1" | "ilimitado";
  yo_antes: boolean;
  yo_futuro_voz: boolean;
  yo_futuro_video: boolean;
  sesion_humana_mes: number;
  marketplace_usd: number;
};

const EMPTY: Form = {
  code: "",
  name: "",
  audience: "personal",
  state: "borrador",
  price_month: 0,
  annual_discount: 0,
  trial_days: 0,
  ai_tier: "Nivel 1",
  voz_min_dia: 0,
  tutores6: true,
  rutas_todas: true,
  offline: false,
  cert: "no",
  yo_antes: true,
  yo_futuro_voz: false,
  yo_futuro_video: false,
  sesion_humana_mes: 0,
  marketplace_usd: 0,
};

function toFeatures(f: Form): Record<string, unknown> {
  const x: Record<string, unknown> = {};
  if (f.voz_min_dia > 0) x.voz_min_dia = f.voz_min_dia;
  else x.voz = "ilimitada";
  x.tutores = f.tutores6 ? 6 : 1;
  x.rutas = f.rutas_todas ? "todas" : 1;
  if (f.offline) x.offline = true;
  if (f.cert === "1") x.cert_anio = 1;
  else if (f.cert === "ilimitado") x.cert_anio = "ilimitado";
  if (f.yo_antes) x.yo_antes = true;
  if (f.yo_futuro_voz) x.yo_futuro_voz = true;
  if (f.yo_futuro_video) x.yo_futuro_video = true;
  if (f.sesion_humana_mes > 0) x.sesion_humana_mes = f.sesion_humana_mes;
  if (f.marketplace_usd > 0) x.marketplace_usd = f.marketplace_usd;
  return x;
}

function fromPlan(p: Plan): Form {
  const fe = p.features as Record<string, any>;
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    audience: (p.audience as Form["audience"]) ?? "personal",
    state: (p.state as Form["state"]) ?? "borrador",
    price_month: Number(p.price_month) || 0,
    annual_discount: Number(p.annual_discount) || 0,
    trial_days: Number(p.trial_days) || 0,
    ai_tier: p.ai_tier ?? "Nivel 1",
    voz_min_dia: fe?.voz === "ilimitada" ? 0 : Number(fe?.voz_min_dia) || 0,
    tutores6: fe?.tutores !== 1,
    rutas_todas: fe?.rutas !== 1,
    offline: !!fe?.offline,
    cert: fe?.cert_anio === "ilimitado" ? "ilimitado" : fe?.cert_anio ? "1" : "no",
    yo_antes: !!fe?.yo_antes,
    yo_futuro_voz: !!fe?.yo_futuro_voz,
    yo_futuro_video: !!fe?.yo_futuro_video,
    sesion_humana_mes: Number(fe?.sesion_humana_mes) || 0,
    marketplace_usd: Number(fe?.marketplace_usd) || 0,
  };
}

const STATE_TONE: Record<string, string> = {
  activo: "text-success",
  borrador: "text-warning",
  archivado: "text-ink-dim",
};

export default function AdminPlanes() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [f, setF] = useState<Form>(EMPTY);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadPlans() {
    const supabase = createClient();
    const { data } = await supabase
      .from("plans")
      .select("id,code,name,audience,state,price_month,annual_discount,trial_days,ai_tier,features")
      .order("audience")
      .order("price_month");
    setPlans((data ?? []) as Plan[]);
  }

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setAllowed(false);
          return;
        }
        const { data: prof } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        if (!prof?.is_admin) {
          setAllowed(false);
          return;
        }
        setAllowed(true);
        await loadPlans();
      } catch {
        setAllowed(false);
      }
    })();
  }, []);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    if (!f.code.trim() || !f.name.trim()) {
      setMsg("Faltan código y nombre.");
      return;
    }
    setSaving(true);
    setMsg(null);
    const row = {
      code: f.code.trim(),
      name: f.name.trim(),
      audience: f.audience,
      state: f.state,
      price_month: f.price_month,
      annual_discount: f.annual_discount,
      trial_days: f.trial_days,
      ai_tier: f.ai_tier,
      features: toFeatures(f),
    };
    try {
      const supabase = createClient();
      let error;
      if (f.id) {
        ({ error } = await supabase.from("plans").update(row).eq("id", f.id));
      } else {
        ({ error } = await supabase.from("plans").insert(row));
      }
      if (error) throw error;
      setMsg(f.id ? "Plan actualizado ✓" : "Plan creado ✓");
      setF(EMPTY);
      await loadPlans();
    } catch (e) {
      setMsg("No se pudo guardar (¿código duplicado?).");
    } finally {
      setSaving(false);
    }
  }

  const annual = (f.price_month * (1 - f.annual_discount / 100)).toFixed(2);
  const previewBullets = planBullets(toFeatures(f));

  if (allowed === null) return <main className="p-8 text-ink-muted">Cargando…</main>;
  if (!allowed)
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-ink">Acceso solo para administradores.</p>
        <Link href="/login" className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white">
          Iniciar sesión
        </Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-4xl px-5 pt-12 pb-28">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/admin" className="text-ink-muted hover:text-ink">‹ Orquestador</Link>
        <span className="text-ink-dim">·</span>
        <Link href="/home" className="text-ink-muted hover:text-ink">Inicio</Link>
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-bright">
        Creador de suscripciones
      </h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Formulario */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nombre comercial">
              <input value={f.name} onChange={(e) => set("name", e.target.value)} className={inp} />
            </Field>
            <Field label="Código (único)">
              <input value={f.code} onChange={(e) => set("code", e.target.value)} className={inp} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Audiencia">
              <select value={f.audience} onChange={(e) => set("audience", e.target.value as Form["audience"])} className={inp}>
                <option value="personal">Personal</option>
                <option value="colegio">Colegio</option>
              </select>
            </Field>
            <Field label="Estado">
              <select value={f.state} onChange={(e) => set("state", e.target.value as Form["state"])} className={inp}>
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="archivado">Archivado</option>
              </select>
            </Field>
            <Field label="Nivel IA">
              <select value={f.ai_tier} onChange={(e) => set("ai_tier", e.target.value)} className={inp}>
                <option>Nivel 1</option>
                <option>Nivel 1-2</option>
                <option>Nivel 2-3</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Precio/mes US$">
              <input type="number" step="0.01" value={f.price_month} onChange={(e) => set("price_month", parseFloat(e.target.value) || 0)} className={inp} />
            </Field>
            <Field label="Desc. anual %">
              <input type="number" value={f.annual_discount} onChange={(e) => set("annual_discount", parseInt(e.target.value) || 0)} className={inp} />
            </Field>
            <Field label="Días prueba">
              <input type="number" value={f.trial_days} onChange={(e) => set("trial_days", parseInt(e.target.value) || 0)} className={inp} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Min. voz/día (0 = ilimitada)">
              <input type="number" value={f.voz_min_dia} onChange={(e) => set("voz_min_dia", parseInt(e.target.value) || 0)} className={inp} />
            </Field>
            <Field label="Certificados/año">
              <select value={f.cert} onChange={(e) => set("cert", e.target.value as Form["cert"])} className={inp}>
                <option value="no">Ninguno</option>
                <option value="1">1 / año</option>
                <option value="ilimitado">Ilimitados</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Sesiones humanas/mes">
              <input type="number" value={f.sesion_humana_mes} onChange={(e) => set("sesion_humana_mes", parseInt(e.target.value) || 0)} className={inp} />
            </Field>
            <Field label="Marketplace US$/mes">
              <input type="number" value={f.marketplace_usd} onChange={(e) => set("marketplace_usd", parseInt(e.target.value) || 0)} className={inp} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Toggle label="Los 6 tutores" v={f.tutores6} on={(v) => set("tutores6", v)} />
            <Toggle label="Todas las rutas" v={f.rutas_todas} on={(v) => set("rutas_todas", v)} />
            <Toggle label="Modo offline" v={f.offline} on={(v) => set("offline", v)} />
            <Toggle label="Yo de antes" v={f.yo_antes} on={(v) => set("yo_antes", v)} />
            <Toggle label="Yo Futuro (voz)" v={f.yo_futuro_voz} on={(v) => set("yo_futuro_voz", v)} />
            <Toggle label="Yo Futuro (video)" v={f.yo_futuro_video} on={(v) => set("yo_futuro_video", v)} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={save} disabled={saving} className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40">
              {saving ? "Guardando…" : f.id ? "Actualizar plan" : "Crear plan"}
            </button>
            {f.id && (
              <button type="button" onClick={() => setF(EMPTY)} className="text-sm text-ink-muted hover:text-ink">
                Nuevo
              </button>
            )}
            {msg && <span className="text-sm text-secondary">{msg}</span>}
          </div>
        </div>

        {/* Vista previa */}
        <div>
          <div className="rounded-lg border border-line bg-surface p-5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-accent">
              {f.audience} · {f.ai_tier}
            </div>
            <div className="mt-1 font-display text-2xl font-extrabold text-ink-bright">
              {f.name || "Plan sin nombre"}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold text-ink-bright">${f.price_month.toFixed(2)}</span>
              <span className="text-sm text-ink-muted">/mes</span>
            </div>
            <div className="text-xs text-secondary">
              {f.annual_discount > 0 ? `$${annual}/mes anual (−${f.annual_discount}%)` : "Sin descuento anual"} · {f.trial_days} días de prueba
            </div>
            <ul className="mt-3 space-y-1.5">
              {previewBullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink"><span className="text-secondary">✓</span>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Lista de planes */}
      <h2 className="mt-10 font-display text-lg font-bold text-ink-bright">Planes ({plans.length})</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setF(fromPlan(p));
              setMsg(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2.5 text-left text-sm transition hover:border-primary"
          >
            <span>
              <span className="font-semibold text-ink-bright">{p.name}</span>
              <span className="ml-2 text-xs text-ink-muted">{p.audience} · ${Number(p.price_month).toFixed(2)}</span>
            </span>
            <span className={"text-xs font-bold " + (STATE_TONE[p.state] ?? "text-ink")}>{p.state}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

const inp =
  "w-full rounded-md border border-line bg-surface2 px-2 py-1.5 text-sm text-ink outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => on(!v)}
      className={
        "flex items-center justify-between rounded-md border px-3 py-2 text-xs transition " +
        (v ? "border-secondary bg-surface2 text-ink-bright" : "border-line bg-surface text-ink-muted")
      }
    >
      {label}
      <span className={"ml-2 h-3.5 w-3.5 rounded-full " + (v ? "bg-secondary" : "bg-surface3")} />
    </button>
  );
}
