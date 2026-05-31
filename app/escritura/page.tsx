"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Feedback de escritura (NLP) — el alumno escribe, el coach resalta una
// fortaleza y UN punto a mejorar (recast), nunca reescribe. Vía writing-coach.

const GENRES = [
  "Email a tu jefe",
  "Mensaje de Slack",
  "Carta de presentación",
  "Servicio al cliente",
];
const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export default function Escritura() {
  const [genre, setGenre] = useState(GENRES[0]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("A2");
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function review() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("writing-coach", {
        body: { text, level, genre },
      });
      if (error) throw error;
      if (!data?.feedback) throw new Error(data?.error ?? "sin feedback");
      setFeedback(data.feedback);
    } catch {
      setError("No pude revisar ahora. Probemos de nuevo en un momento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Escribe sin miedo
      </h1>
      <p className="mt-2 text-ink-muted">
        Escribe en inglés. Te resalto lo bueno y un solo punto a mejorar — nunca
        reescribo por ti.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGenre(g)}
            className={
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
              (g === genre
                ? "border-primary bg-primary/10 text-ink-bright"
                : "border-line bg-surface2 text-ink-muted hover:text-ink")
            }
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label className="text-xs text-ink-muted">Tu nivel</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
          className="rounded-md border border-line bg-surface2 px-2 py-1 text-sm text-ink"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder="Write your message in English here…"
        className="mt-4 w-full rounded-lg border border-line bg-surface2 px-3 py-3 text-sm text-ink outline-none focus:border-primary"
      />

      <button
        type="button"
        onClick={review}
        disabled={loading || !text.trim()}
        className="mt-3 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
      >
        {loading ? "Revisando…" : "Revisar"}
      </button>

      {error && (
        <p className="mt-4 rounded-md border border-warning bg-surface2 px-3 py-2 text-sm text-warning">
          {error}
        </p>
      )}

      {feedback && (
        <div className="mt-5 rounded-lg border border-line bg-surface p-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-secondary">
            Feedback de tu tutor
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
            {feedback}
          </p>
        </div>
      )}
    </main>
  );
}
