"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { award } from "@/lib/gamify";
import { L1_DECK } from "@/lib/l1deck";

// Repaso diario · SM-2 simplificado. Requiere sesión (datos por usuario).
// Mazo inicial de frases útiles si el usuario aún no tiene tarjetas.

type Item = {
  id: string;
  front: string;
  back: string;
  ease: number;
  interval_days: number;
  reps: number;
  due_at: string;
};

const STARTER_DECK: { front: string; back: string }[] = [
  { front: "How can I help you today?", back: "¿En qué puedo ayudarle hoy?" },
  { front: "Let me put you on hold for a moment.", back: "Permítame ponerlo en espera un momento." },
  { front: "I understand how frustrating that is.", back: "Entiendo lo frustrante que es eso." },
  { front: "Tell me about yourself.", back: "Háblame de ti." },
  { front: "What are your strengths?", back: "¿Cuáles son tus fortalezas?" },
  { front: "What did you work on yesterday?", back: "¿En qué trabajaste ayer?" },
  { front: "I'm blocked on this task.", back: "Estoy bloqueado en esta tarea." },
  { front: "I have an appointment at 3 PM.", back: "Tengo una cita a las 3 de la tarde." },
  { front: "Could you repeat that, please?", back: "¿Podría repetirlo, por favor?" },
  { front: "Can I have the menu, please?", back: "¿Me da el menú, por favor?" },
  { front: "How do I get to the train station?", back: "¿Cómo llego a la estación de tren?" },
  { front: "Thank you so much for your help.", back: "Muchas gracias por su ayuda." },
];

function schedule(item: Item, quality: number) {
  let ease = Number(item.ease) || 2.5;
  let interval = Number(item.interval_days) || 0;
  let reps = Number(item.reps) || 0;
  if (quality < 3) {
    reps = 0;
    interval = 0; // se vuelve a ver hoy
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.max(1, Math.round(interval * ease));
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  const due = new Date(Date.now() + interval * 86400000).toISOString();
  return {
    ease: Number(ease.toFixed(2)),
    interval_days: interval,
    reps,
    due_at: due,
  };
}

export default function Repaso() {
  const [state, setState] = useState<"loading" | "guest" | "ready">("loading");
  const [queue, setQueue] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [upcoming, setUpcoming] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setState("guest");
          return;
        }
        // Siembra el mazo inicial + el mazo "consciente del español" (falsos
        // amigos). Idempotente: solo inserta las tarjetas que aún no tengas.
        const { data: existing } = await supabase
          .from("review_items")
          .select("front")
          .eq("user_id", user.id);
        const have = new Set((existing ?? []).map((r: { front: string }) => r.front));
        const seed = [...STARTER_DECK, ...L1_DECK].filter((d) => !have.has(d.front));
        if (seed.length) {
          await supabase
            .from("review_items")
            .insert(seed.map((d) => ({ user_id: user.id, front: d.front, back: d.back })));
        }
        const nowIso = new Date().toISOString();
        const { data: due } = await supabase
          .from("review_items")
          .select("*")
          .eq("user_id", user.id)
          .lte("due_at", nowIso)
          .order("due_at")
          .limit(50);
        const { count: up } = await supabase
          .from("review_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gt("due_at", nowIso);
        setQueue((due ?? []) as Item[]);
        setUpcoming(up ?? 0);
        setState("ready");
      } catch {
        setState("guest");
      }
    })();
  }, []);

  async function rate(quality: number) {
    const item = queue[idx];
    if (!item) return;
    const sched = schedule(item, quality);
    try {
      const supabase = createClient();
      await supabase.from("review_items").update(sched).eq("id", item.id);
    } catch {
      /* ignore */
    }
    await award(5, done === 0 ? { id: "first-review", label: "Tu primer repaso" } : undefined);
    setDone((d) => d + 1);
    setRevealed(false);
    if (quality < 3) {
      // vuelve a verse al final de esta sesión
      setQueue((q) => [...q, { ...item, ...sched }]);
    }
    setIdx((i) => i + 1);
  }

  const current = state === "ready" ? queue[idx] : undefined;

  return (
    <main className="mx-auto max-w-xl px-5 pt-12 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Repaso de hoy
      </h1>
      <p className="mt-2 text-ink-muted">
        Repaso espaciado: lo que ya sabes vuelve menos seguido; lo difícil, más.
        Sesiones cortas, a tu ritmo.
      </p>

      {state === "loading" && <p className="mt-6 text-ink-muted">Cargando…</p>}

      {state === "guest" && (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <p className="text-ink">Inicia sesión para guardar tu repaso.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {state === "ready" && current && (
        <div className="mt-6">
          <div className="mb-2 text-xs text-ink-muted">
            Tarjeta {done + 1} · {queue.length - idx} en cola
          </div>
          <div className="rounded-lg border border-line bg-surface p-8 text-center">
            <div className="font-display text-2xl font-extrabold text-ink-bright">
              {current.front}
            </div>
            {revealed ? (
              <p className="mt-4 text-lg text-secondary">{current.back}</p>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-5 rounded-md bg-surface2 px-5 py-2.5 text-sm font-semibold text-ink hover:text-ink-bright"
              >
                Mostrar respuesta
              </button>
            )}
          </div>

          {revealed && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => rate(0)}
                className="rounded-md border border-warning py-3 text-sm font-bold text-warning"
              >
                Otra vez
              </button>
              <button
                type="button"
                onClick={() => rate(4)}
                className="rounded-md bg-surface2 py-3 text-sm font-bold text-ink-bright hover:bg-surface3"
              >
                Bien
              </button>
              <button
                type="button"
                onClick={() => rate(5)}
                className="rounded-md bg-secondary py-3 text-sm font-bold text-bg"
              >
                Fácil
              </button>
            </div>
          )}
        </div>
      )}

      {state === "ready" && !current && (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <div className="text-3xl">🎉</div>
          <p className="mt-2 font-display text-lg font-bold text-ink-bright">
            {done > 0 ? "¡Listo por hoy!" : "Nada por repasar ahora"}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {done > 0 && `Repasaste ${done} tarjeta${done === 1 ? "" : "s"}. `}
            {upcoming > 0
              ? `${upcoming} te esperan más adelante.`
              : "Vuelve mañana para seguir fijando lo aprendido."}
          </p>
          <Link
            href="/home"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            Volver al inicio
          </Link>
        </div>
      )}
    </main>
  );
}
