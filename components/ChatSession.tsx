"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RehearsalToggle } from "@/components/ui/RehearsalToggle";
import { cn } from "@/lib/cn";
import { award } from "@/lib/gamify";

// Chat de práctica con el tutor. Si recibe un "scenario", el tutor hace
// role-play (call center) y el "goal" se muestra como objetivo de la lección.

type Msg = { role: "user" | "tutor"; text: string; meta?: string };
const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Level = (typeof LEVELS)[number];

export function ChatSession({
  scenario,
  starter,
  goal,
  lessonId,
}: {
  scenario?: string;
  starter?: string;
  goal?: string;
  lessonId?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "tutor",
      text:
        starter ??
        "Hi! I am here to help you practice. Take your time, there are no wrong answers here.",
      meta: scenario ? "role-play" : "tu tutor",
    },
  ]);
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<Level>("A2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const [done, setDone] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(
    secs % 60,
  ).padStart(2, "0")}`;

  async function ask(text: string) {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("tutor-brain", {
        body: { message: text, level, scenario },
      });
      if (error) throw error;
      if (!data?.reply) throw new Error(data?.error ?? "sin respuesta");
      const meta = data.model ? `vía ${data.model} · Nivel ${data.tier}` : undefined;
      setMessages((m) => [...m, { role: "tutor", text: data.reply, meta }]);
      award(10, { id: "first-conversation", label: "Hablaste con tu tutor" });
    } catch {
      setError("El tutor no pudo responder ahora. Vamos de nuevo cuando quieras.");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setLastSent(text);
    setInput("");
    await ask(text);
  }

  async function finish() {
    if (done) return;
    setDone(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && lessonId) {
        await supabase.from("progress").upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            status: "done",
            xp: 25,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" },
        );
      }
    } catch {
      /* invitado o error: el XP local igual cuenta */
    }
    await award(25, { id: "lesson-done", label: "Completaste una lección" });
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-4 py-4">
      <header className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <Link href="/home" className="text-sm text-ink-muted hover:text-ink">
          ‹ Inicio
        </Link>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span>⏱ {mmss}</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            className="rounded-md border border-line bg-surface2 px-2 py-1 text-ink"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                Nivel {l}
              </option>
            ))}
          </select>
        </div>
      </header>

      {goal && (
        <div className="mt-3 rounded-md border border-line bg-surface2 px-3 py-2 text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wide text-secondary">
            Objetivo
          </span>
          <p className="text-ink">{goal}</p>
        </div>
      )}

      {lessonId && (
        <button
          type="button"
          onClick={finish}
          disabled={done}
          className={
            "mt-3 w-full rounded-md px-4 py-2.5 text-sm font-bold transition " +
            (done
              ? "bg-secondary text-bg"
              : "border border-line bg-surface2 text-ink-bright hover:border-primary")
          }
        >
          {done ? "✓ Lección completada (+25 XP)" : "Terminar lección"}
        </button>
      )}

      <div className="py-3">
        <RehearsalToggle onChange={() => {}} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col",
              m.role === "user" ? "items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm",
                m.role === "user"
                  ? "bg-primary text-white"
                  : "border border-line bg-surface2 text-ink",
              )}
            >
              {m.text}
            </div>
            {m.meta && (
              <span className="mt-1 text-[10px] text-ink-dim">{m.meta}</span>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm text-ink-muted">
              El tutor está pensando…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-md border border-warning bg-surface2 px-3 py-2 text-sm text-warning">
          <span>{error}</span>
          {lastSent && (
            <button
              type="button"
              onClick={() => ask(lastSent)}
              className="rounded-md border border-warning px-2 py-1 text-xs font-semibold"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-line pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Escribe en inglés… (o como puedas, sin miedo)"
          className="flex-1 rounded-md border border-line bg-surface2 px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
      <p className="pt-2 text-center text-[11px] text-ink-dim">
        Pronto podrás responder por voz. Por ahora, escribir también cuenta.
      </p>
    </main>
  );
}
