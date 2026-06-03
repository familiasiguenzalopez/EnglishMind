"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LessonBar } from "@/components/LessonBar";

// Vocabulario (lección del camino, kind 'vocab'). Tarjetas EN → ES + ejemplo.
// Al terminar, las palabras se pueden sumar al repaso espaciado (review_items).
type Word = { en: string; es: string; example?: string };

export default function Vocabulario() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [review, setReview] = useState<Word[]>([]);
  const [added, setAdded] = useState<null | number>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("leccion");
    if (!id) return;
    setLessonId(id);
    createClient()
      .from("lessons")
      .select("content")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        const c = (data?.content ?? {}) as { goal?: string; words?: Word[] };
        setGoal(c.goal ?? null);
        setWords(Array.isArray(c.words) ? c.words : []);
      });
  }, []);

  const finished = words.length > 0 && idx >= words.length;
  const current = words[idx];

  function rate(knew: boolean) {
    if (!current) return;
    if (!knew) setReview((r) => [...r, current]);
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  async function addToReview() {
    try {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        setAdded(0);
        return;
      }
      const { data: existing } = await sb
        .from("review_items")
        .select("front")
        .eq("user_id", user.id);
      const have = new Set((existing ?? []).map((r: { front: string }) => r.front));
      const toAdd = words
        .filter((w) => !have.has(w.en))
        .map((w) => ({ user_id: user.id, front: w.en, back: w.es }));
      if (toAdd.length) await sb.from("review_items").insert(toAdd);
      setAdded(toAdd.length);
    } catch {
      setAdded(0);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-5 pt-10 pb-28">
      <Link href="/aprender" className="text-sm text-ink-muted hover:text-ink">‹ Camino</Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-bright">Vocabulario</h1>
      <p className="mt-2 text-ink-muted">
        Aprende las palabras clave: mira la frase, intenta recordarla y revela el significado.
      </p>

      <div className="mt-5">
        <LessonBar lessonId={lessonId} goal={goal} ready={finished} />
      </div>

      {words.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Cargando palabras…</p>
      ) : !finished ? (
        <>
          <div className="mb-2 text-xs text-ink-muted">
            Palabra {idx + 1} de {words.length}
          </div>
          <div className="rounded-lg border border-line bg-surface p-8 text-center">
            <div className="font-display text-3xl font-extrabold text-ink-bright">{current.en}</div>
            {revealed ? (
              <div className="mt-4">
                <p className="text-lg text-secondary">{current.es}</p>
                {current.example && (
                  <p className="mt-2 text-sm italic text-ink-muted">“{current.example}”</p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-5 rounded-md bg-surface2 px-5 py-2.5 text-sm font-semibold text-ink hover:text-ink-bright"
              >
                Mostrar significado
              </button>
            )}
          </div>

          {revealed && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => rate(false)}
                className="rounded-md border border-warning py-3 text-sm font-bold text-warning"
              >
                Repasar
              </button>
              <button
                type="button"
                onClick={() => rate(true)}
                className="rounded-md bg-secondary py-3 text-sm font-bold text-bg"
              >
                Lo sé
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-2 rounded-lg border border-line bg-surface p-6 text-center">
          <div className="text-3xl">📚</div>
          <p className="mt-2 font-display text-lg font-bold text-ink-bright">
            ¡Repasaste {words.length} palabras!
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {review.length > 0
              ? `${review.length} para reforzar.`
              : "¡Las dominaste todas!"}
          </p>
          {added === null ? (
            <button
              type="button"
              onClick={addToReview}
              className="mt-4 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
            >
              ➕ Añadir al repaso espaciado
            </button>
          ) : (
            <p className="mt-4 text-sm text-secondary">
              {added > 0
                ? `${added} palabra${added === 1 ? "" : "s"} añadida${added === 1 ? "" : "s"} a tu repaso ✓`
                : "Inicia sesión para guardar el repaso."}
            </p>
          )}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                setIdx(0);
                setRevealed(false);
                setReview([]);
              }}
              className="text-xs text-ink-dim hover:text-ink"
            >
              Repasar de nuevo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
