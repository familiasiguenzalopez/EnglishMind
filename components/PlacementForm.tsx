"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { saveCefr } from "@/lib/level";
import { CefrBadge, type CefrLevel } from "@/components/ui/CefrBadge";

const VALID = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function PlacementForm({ ruta }: { ruta: string | null }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    level: CefrLevel;
    rationale: string;
    canDo: string;
  } | null>(null);

  const next = ruta ? `/ruta/${ruta}` : "/home";

  async function evaluate() {
    if (text.trim().length < 5 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("placement", {
        body: { sample: text },
      });
      if (error) throw error;
      const level = (VALID.includes(data?.level) ? data.level : "A2") as CefrLevel;
      setResult({
        level,
        rationale: data?.rationale ?? "",
        canDo: data?.canDo ?? "",
      });
      await saveCefr(level);
    } catch {
      setError("No pudimos evaluar ahora. Probemos de nuevo cuando quieras.");
    } finally {
      setLoading(false);
    }
  }

  function dictate() {
    const w = window as unknown as Record<string, any>;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("Tu navegador no soporta dictado; escribe tu respuesta.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (e: any) => {
      const t = String(e.results[0][0].transcript);
      setText((prev) => (prev ? prev + " " : "") + t);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-center">
        <div className="flex justify-center">
          <CefrBadge level={result.level} />
        </div>
        <p className="mt-3 text-ink">{result.rationale}</p>
        {result.canDo && (
          <p className="mt-2 text-sm text-secondary">✓ {result.canDo}</p>
        )}
        <Link
          href={next}
          className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
        >
          Continuar
        </Link>
        <p className="mt-3 text-xs text-ink-dim">
          Es una estimación para empezar; tu nivel se ajusta conforme practicas.
        </p>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Write a few sentences in English… (escribe como puedas, sin miedo)"
        className="w-full rounded-md border border-line bg-surface2 px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={evaluate}
          disabled={loading || text.trim().length < 5}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
        >
          {loading ? "Evaluando…" : "Listo, conóceme"}
        </button>
        <button
          type="button"
          onClick={dictate}
          disabled={listening}
          className="rounded-md border border-line bg-surface2 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-primary disabled:opacity-50"
        >
          {listening ? "Escuchando…" : "🎤 Dictar"}
        </button>
        <Link
          href={next}
          className="self-center px-2 text-sm text-ink-muted hover:text-ink"
        >
          Saltar por ahora
        </Link>
      </div>
      {error && <p className="mt-3 text-sm text-warning">{error}</p>}
    </div>
  );
}
