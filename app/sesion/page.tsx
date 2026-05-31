"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RehearsalToggle } from "@/components/ui/RehearsalToggle";
import { cn } from "@/lib/cn";

// Pantalla C (modo texto primero) — sesión con el tutor.
// Llama a la Edge Function tutor-brain (Claude -> Gemini con fallback).
// Diseñada contra el miedo a hablar: modo ensayo, reintento sin penalización,
// error amable. La voz (PTT) llega en una iteración posterior.

type Msg = { role: "user" | "tutor"; text: string; meta?: string };
const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Level = (typeof LEVELS)[number];

export default function Sesion() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "tutor",
      text: "Hi! I'm here to help you practice. Take your time — there are no wrong answers here.",
      meta: "tu tutor",
    },
  ]);
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<Level>("A2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
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
        body: { message: text, level },
      });
      if (error) throw error;
      if (!data?.reply) throw new Error(data?.error ?? "sin respuesta");
      const meta = data.model ? `vía ${data.model} · Nivel ${data.tier}` : undefined;
      setMessages((m) => [...m, { role: "tutor", text: data.reply, meta }]);
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

  return (
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-4 py-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <Link href="/tutores" className="text-sm text-ink-muted hover:text-ink">
          ‹ Tutores
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

      <div className="py-3">
        <RehearsalToggle onChange={() => {}} />
      </div>

      {/* Mensajes */}
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

      {/* Error amable + reintento */}
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

      {/* Input */}
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
