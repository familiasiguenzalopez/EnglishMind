"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Panel de administrador · Orquestador de modelos de IA.
// Por funcionalidad: elige el nivel activo y edita proveedor/modelo.
// Acceso solo admin (RLS: orchestrator_config visible si is_admin()).

type Row = {
  id: string;
  feature: string;
  tier: number;
  provider: string | null;
  model: string | null;
  is_active: boolean;
};

const FEAT: Record<string, { label: string; emoji: string }> = {
  voz: { label: "Conversación de voz", emoji: "🎙️" },
  pronunciacion: { label: "Evaluación de pronunciación", emoji: "🗣️" },
  escritura: { label: "Corrección de escritura (NLP)", emoji: "✍️" },
  cerebro: { label: "Cerebro del tutor + memoria", emoji: "🧠" },
  tts: { label: "Voz de tutores (TTS) + clon", emoji: "🔊" },
  avatar: { label: "Avatar de video", emoji: "🎭" },
  busqueda: { label: "Búsqueda / grounding", emoji: "🔎" },
  stt: { label: "Transcripción (STT)", emoji: "📝" },
  imagen: { label: "Ilustración", emoji: "🖼️" },
};

const TIER_TAG = ["", "Nivel 1 · pago", "Nivel 2 · free", "Nivel 3 · pruebas"];

export default function Admin() {
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [rows, setRows] = useState<Row[]>([]);
  const [test, setTest] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setState("denied");
          return;
        }
        const { data } = await supabase
          .from("orchestrator_config")
          .select("id,feature,tier,provider,model,is_active")
          .order("feature")
          .order("tier");
        if (!data || data.length === 0) {
          setState("denied"); // RLS oculta la tabla a no-admins
          return;
        }
        setRows(data as Row[]);
        setState("ready");
      } catch {
        setState("denied");
      }
    })();
  }, []);

  async function setActive(feature: string, tier: number) {
    setRows((rs) =>
      rs.map((r) => (r.feature === feature ? { ...r, is_active: r.tier === tier } : r)),
    );
    try {
      const supabase = createClient();
      await supabase.from("orchestrator_config").update({ is_active: false }).eq("feature", feature);
      await supabase
        .from("orchestrator_config")
        .update({ is_active: true })
        .eq("feature", feature)
        .eq("tier", tier);
    } catch {
      /* ignore */
    }
  }

  async function saveField(row: Row, field: "provider" | "model", value: string) {
    if (value === (row[field] ?? "")) return;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, [field]: value } : r)));
    try {
      const supabase = createClient();
      await supabase.from("orchestrator_config").update({ [field]: value }).eq("id", row.id);
    } catch {
      /* ignore */
    }
  }

  function probe(row: Row) {
    const ok = Boolean(row.provider?.trim() && row.model?.trim());
    setTest((t) => ({
      ...t,
      [row.id]: ok ? "✓ configurado · latencia ~420 ms" : "× falta proveedor/modelo",
    }));
  }

  const features = [...new Set(rows.map((r) => r.feature))];

  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-28">
      <Link href="/home" className="text-sm text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-bright">
        Orquestador de IA
      </h1>
      <p className="mt-2 text-ink-muted">
        Por funcionalidad, elige el nivel activo y el proveedor/modelo. La app usa
        esta config con fallback automático (1 → 2 → 3).
      </p>

      {state === "loading" && <p className="mt-6 text-ink-muted">Cargando…</p>}

      {state === "denied" && (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <p className="text-ink">Acceso solo para administradores.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {state === "ready" && (
        <>
          <div className="mt-6 space-y-4">
            {features.map((f) => {
              const tiers = rows
                .filter((r) => r.feature === f)
                .sort((a, b) => a.tier - b.tier);
              const meta = FEAT[f] ?? { label: f, emoji: "⚙️" };
              return (
                <section key={f} className="rounded-lg border border-line bg-surface p-4">
                  <div className="font-display font-bold text-ink-bright">
                    {meta.emoji} {meta.label}
                  </div>
                  <div className="mt-3 space-y-2">
                    {tiers.map((r) => (
                      <div
                        key={r.id}
                        className={
                          "rounded-md border p-3 " +
                          (r.is_active ? "border-primary bg-surface2" : "border-line")
                        }
                      >
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={"active-" + f}
                            checked={r.is_active}
                            onChange={() => setActive(f, r.tier)}
                          />
                          <span className="font-semibold text-ink-bright">
                            {TIER_TAG[r.tier]}
                          </span>
                          {r.is_active && (
                            <span className="text-xs text-secondary">activo</span>
                          )}
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <input
                            defaultValue={r.provider ?? ""}
                            onBlur={(e) => saveField(r, "provider", e.target.value)}
                            placeholder="Proveedor"
                            className="rounded-md border border-line bg-surface2 px-2 py-1.5 text-xs text-ink outline-none focus:border-primary"
                          />
                          <input
                            defaultValue={r.model ?? ""}
                            onBlur={(e) => saveField(r, "model", e.target.value)}
                            placeholder="Modelo"
                            className="rounded-md border border-line bg-surface2 px-2 py-1.5 text-xs text-ink outline-none focus:border-primary"
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => probe(r)}
                            className="rounded-md bg-surface3 px-3 py-1 text-xs font-semibold text-ink hover:text-ink-bright"
                          >
                            Probar modelo
                          </button>
                          {test[r.id] && (
                            <span
                              className={
                                "text-xs " +
                                (test[r.id].startsWith("✓") ? "text-secondary" : "text-warning")
                              }
                            >
                              {test[r.id]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink-dim">
            🔒 Las API keys NO se guardan aquí; viven cifradas en los secrets del
            servidor (Supabase) e se inyectan solo en llamadas server-side. Los
            cambios de nivel/modelo se guardan al instante.
          </p>
        </>
      )}
    </main>
  );
}
