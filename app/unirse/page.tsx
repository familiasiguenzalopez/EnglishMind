"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Unirse() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ org: string; cohort: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Inicia sesión primero para unirte.");
        return;
      }
      const { data, error } = await supabase.rpc("join_cohort", { p_code: code.trim() });
      if (error) throw error;
      setResult(data as { org: string; cohort: string });
    } catch {
      setError("Código inválido. Revísalo e intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 pt-12 pb-28">
      <Link href="/home" className="text-sm text-ink-muted hover:text-ink">‹ Inicio</Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-bright">
        Unirme con un código
      </h1>
      <p className="mt-2 text-ink-muted">
        ¿Tu colegio o empresa te dio un código? Escríbelo para unirte a tu grupo.
      </p>

      {result ? (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <div className="text-3xl">🎉</div>
          <p className="mt-2 text-ink-bright">
            Te uniste a <span className="font-bold">{result.cohort ?? "tu cohorte"}</span> de{" "}
            <span className="font-bold">{result.org}</span>.
          </p>
          <Link href="/home" className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Empezar
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Código (ej. A1B2C3)"
            className="w-full rounded-md border border-line bg-surface2 px-3 py-2.5 text-center font-mono text-lg tracking-widest text-ink outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={join}
            disabled={busy || !code.trim()}
            className="mt-3 w-full rounded-md bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
          >
            {busy ? "Uniéndome…" : "Unirme"}
          </button>
          {error && <p className="mt-3 text-sm text-warning">{error}</p>}
          <p className="mt-4 text-center text-xs text-ink-dim">
            Tu progreso es tuyo. El staff verá tu nivel y avance, nunca tus conversaciones.
          </p>
        </div>
      )}
    </main>
  );
}
