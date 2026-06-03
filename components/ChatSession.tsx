"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RehearsalToggle } from "@/components/ui/RehearsalToggle";
import { cn } from "@/lib/cn";
import { award } from "@/lib/gamify";
import { loadTutorPrefs, saveTutorPrefs, type TutorPrefs } from "@/lib/tutorPrefs";
import { SceneStage } from "@/components/scene/SceneStage";
import { type CharState } from "@/components/scene/SceneCharacter";
import { loadLook, type AvatarLook } from "@/lib/avatar";
import { getScene, type Scene } from "@/lib/scenes";
import { recordSession, type Insight } from "@/lib/learnlog";
import { loadMemory, saveMemory, mergeFacts } from "@/lib/tutorMemory";
import { skillLabel } from "@/lib/skills";

// Conversación v2 (estilo Speak): personaje que habla (avatar animado + TTS),
// micrófono para hablar (Web Speech), respuestas sugeridas y debrief al cerrar.

type Msg = { role: "user" | "tutor"; text: string; meta?: string };
type Debrief = {
  wins: string;
  improve: string;
  phrases: string[];
  canDo: string;
  focus?: { category: string; note: string }[];
};
const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Level = (typeof LEVELS)[number];

export function ChatSession({
  scene: sceneProp,
  scenario,
  starter,
  goal,
  lessonId,
}: {
  scene?: Scene;
  scenario?: string;
  starter?: string;
  goal?: string;
  lessonId?: string;
}) {
  const isRoleplay = !!scenario;
  const scene = sceneProp ?? getScene("tutor")!;

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "tutor",
      text:
        starter ??
        "Hi! I'm here to help you practice. Take your time — there are no wrong answers here.",
      meta: isRoleplay ? "role-play" : "tu tutor",
    },
  ]);
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<Level>("A2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const [done, setDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSug, setLoadingSug] = useState(false);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [improved, setImproved] = useState<Insight[]>([]);
  const [prefs, setPrefs] = useState<TutorPrefs | null>(null);
  const [look, setLook] = useState<AvatarLook | null>(null);
  const [talkPulse, setTalkPulse] = useState(0);
  const [memory, setMemory] = useState<string[]>([]);
  const [memExtracted, setMemExtracted] = useState(false);
  const [stuck, setStuck] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    const w = window as unknown as Record<string, unknown>;
    setSttSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    loadTutorPrefs().then((p) => {
      setPrefs(p);
      setMuted(!p.autoplay);
    });
    setLook(loadLook());
    if (!isRoleplay) loadMemory().then(setMemory);
    armHint();
    return () => {
      clearInterval(t);
      if (hintRef.current) clearTimeout(hintRef.current);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Memoria del tutor (charla libre): tras unos turnos, extrae datos durables
  // del alumno y los guarda para recordarlos en la próxima charla.
  useEffect(() => {
    if (isRoleplay || memExtracted) return;
    if (messages.filter((m) => m.role === "user").length < 3) return;
    setMemExtracted(true);
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.functions.invoke("convo-coach", {
          body: { mode: "remember", level, history: buildHistory() },
        });
        const facts = Array.isArray(data?.facts) ? (data.facts as string[]) : [];
        if (facts.length) {
          const merged = mergeFacts(memory, facts);
          setMemory(merged);
          await saveMemory(merged);
        }
      } catch {
        /* sin memoria */
      }
    })();
  }, [messages, isRoleplay, memExtracted, level, memory]);

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const charState: CharState = speaking
    ? "speaking"
    : recognizing
      ? "listening"
      : loading
        ? "thinking"
        : "idle";

  function pickVoice(accent: string): SpeechSynthesisVoice | undefined {
    if (typeof window === "undefined" || !window.speechSynthesis) return undefined;
    const vs = window.speechSynthesis.getVoices();
    return vs.find((v) => v.lang === accent) || vs.find((v) => v.lang.startsWith(accent.slice(0, 2)));
  }
  function speak(text: string, force = false) {
    if ((!force && muted) || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.split("💡")[0].trim());
      const accent = prefs?.accent ?? "en-US";
      const v = pickVoice(accent);
      if (v) u.voice = v;
      u.lang = accent;
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onboundary = () => setTalkPulse((p) => p + 1);
      window.speechSynthesis.speak(u);
    } catch {
      /* sin TTS */
    }
  }

  function buildHistory() {
    const h = messages.slice(1).map((m) => ({
      role: m.role === "tutor" ? ("assistant" as const) : ("user" as const),
      content: m.text,
    }));
    while (h.length && h[h.length - 1].role === "user") h.pop();
    return h;
  }

  // Hints proactivos: si tras la respuesta del tutor te quedas sin escribir,
  // ofrecemos una idea (suave, sin presionar). Se cancela al teclear/hablar/enviar.
  function disarmHint() {
    if (hintRef.current) {
      clearTimeout(hintRef.current);
      hintRef.current = null;
    }
    setStuck(false);
  }
  function armHint() {
    disarmHint();
    hintRef.current = setTimeout(() => {
      setStuck(true);
      void askSuggest();
    }, 9000);
  }

  async function ask(text: string) {
    setError(null);
    setLoading(true);
    setSuggestions([]);
    disarmHint();
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("tutor-brain", {
        body: { message: text, level, scenario, starter, tone: prefs?.tone, memory: isRoleplay ? undefined : memory, history: buildHistory() },
      });
      if (error) throw error;
      if (!data?.reply) throw new Error(data?.error ?? "sin respuesta");
      const meta = data.model ? `vía ${data.model} · Nivel ${data.tier}` : undefined;
      setMessages((m) => [...m, { role: "tutor", text: data.reply, meta }]);
      speak(data.reply);
      armHint();
      award(10, { id: "first-conversation", label: "Hablaste con tu tutor" });
    } catch {
      setError("El tutor no pudo responder ahora. Vamos de nuevo cuando quieras.");
    } finally {
      setLoading(false);
    }
  }

  async function sendText(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    await ask(t);
  }

  function mic() {
    disarmHint();
    const w = window as unknown as Record<string, any>;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    setRecognizing(true);
    rec.onresult = (e: any) => {
      const t = String(e.results[0][0].transcript);
      setRecognizing(false);
      sendText(t);
    };
    rec.onerror = () => setRecognizing(false);
    rec.onend = () => setRecognizing(false);
    try {
      rec.start();
    } catch {
      setRecognizing(false);
    }
  }

  async function askSuggest() {
    setLoadingSug(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.functions.invoke("convo-coach", {
        body: { mode: "suggest", scenario, goal, level, history: buildHistory() },
      });
      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
    } catch {
      /* sin sugerencias */
    } finally {
      setLoadingSug(false);
    }
  }

  async function finish() {
    if (done || finishing) return;
    setFinishing(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.functions.invoke("convo-coach", {
        body: { mode: "debrief", scenario, goal, level, history: buildHistory() },
      });
      setDebrief(data as Debrief);
      const rec = await recordSession(
        "conversation",
        lessonId ?? null,
        level,
        (data as Debrief)?.focus ?? [],
      );
      setImproved(rec.improved);
      if (rec.improved.length) await award(10);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && lessonId) {
          await supabase.from("progress").upsert(
            { user_id: user.id, lesson_id: lessonId, status: "done", xp: 25, completed_at: new Date().toISOString() },
            { onConflict: "user_id,lesson_id" },
          );
        }
      } catch {
        /* invitado */
      }
      await award(25, { id: "lesson-done", label: "Completaste una lección" });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setFinishing(false);
    }
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col px-4 py-3">
      {/* Barra superior */}
      <header className="flex items-center justify-between gap-3 text-xs text-ink-muted">
        <Link href="/home" className="hover:text-ink">‹ Inicio</Link>
        <div className="flex items-center gap-3">
          <span>⏱ {mmss}</span>
          <button
            type="button"
            onClick={() => {
              const willMute = !muted;
              if (willMute && typeof window !== "undefined") window.speechSynthesis?.cancel();
              setMuted(willMute);
              void saveTutorPrefs({
                accent: prefs?.accent ?? "en-US",
                tone: prefs?.tone ?? "Cercano",
                autoplay: !willMute,
              });
            }}
            title="Voz del tutor"
          >
            {muted ? "🔇" : "🔊"}
          </button>
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

      {/* Escenario: fondo ambientado + personaje 2D animado */}
      <div className="pt-2">
        <SceneStage scene={scene} state={charState} look={look ?? undefined} pulse={talkPulse} />
      </div>

      {goal && (
        <div className="mt-1 rounded-md border border-line bg-surface2 px-3 py-1.5 text-xs">
          <span className="font-bold uppercase tracking-wide text-secondary">Objetivo </span>
          <span className="text-ink">{goal}</span>
        </div>
      )}

      <div className="py-2">
        <RehearsalToggle onChange={() => {}} />
      </div>

      {/* Conversación */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-2">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm",
                m.role === "user" ? "bg-primary text-white" : "border border-line bg-surface2 text-ink",
              )}
            >
              {m.text}
            </div>
            {m.role === "tutor" && (
              <button
                type="button"
                onClick={() => speak(m.text, true)}
                className="mt-1 text-[10px] text-ink-dim hover:text-ink"
              >
                🔊 escuchar
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm text-ink-muted">…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="mb-2 text-sm text-warning">{error}</p>}

      {stuck && (
        <p className="mb-1 text-xs text-secondary">
          💡 Tómate tu tiempo… aquí va una idea para responder:
        </p>
      )}
      {/* Sugerencias */}
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendText(s)}
              className="rounded-full border border-secondary bg-surface2 px-3 py-1.5 text-xs text-ink-bright hover:bg-surface3"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Entrada: micrófono + texto */}
      <div className="flex items-center gap-2 border-t border-line pt-3">
        {sttSupported && (
          <button
            type="button"
            onClick={mic}
            disabled={recognizing || loading}
            className={cn(
              "grid h-11 w-11 flex-none place-items-center rounded-full text-lg transition disabled:opacity-50",
              recognizing ? "bg-danger text-white" : "bg-primary text-white hover:bg-primary-dim",
            )}
            title="Hablar"
          >
            🎤
          </button>
        )}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            disarmHint();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendText(input);
            }
          }}
          placeholder={sttSupported ? "Habla 🎤 o escribe…" : "Escribe en inglés…"}
          className="flex-1 rounded-md border border-line bg-surface2 px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => sendText(input)}
          disabled={loading || !input.trim()}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
        >
          Enviar
        </button>
      </div>

      {/* Acciones */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={askSuggest}
          disabled={loadingSug}
          className="rounded-md border border-line bg-surface2 px-3 py-1.5 font-semibold text-ink-bright hover:border-primary disabled:opacity-50"
        >
          {loadingSug ? "Pensando…" : "💬 ¿Qué digo?"}
        </button>
        {(lessonId || scenario) && (
          <button
            type="button"
            onClick={finish}
            disabled={finishing || done}
            className="rounded-md border border-secondary px-3 py-1.5 font-semibold text-secondary disabled:opacity-50"
          >
            {finishing ? "Cerrando…" : done ? "✓ Completada" : "Terminar lección"}
          </button>
        )}
      </div>

      {/* Debrief (cierre estilo Speak) */}
      {debrief && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5">
          <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6">
            <div className="text-center text-3xl">🎉</div>
            <h3 className="mt-1 text-center font-display text-xl font-extrabold text-ink-bright">
              ¡Buena práctica!
            </h3>
            {improved.length > 0 && (
              <div className="mt-3 rounded-md border border-secondary bg-surface2 p-3 text-center">
                <div className="text-sm font-bold text-secondary">📈 ¡Vas mejorando!</div>
                {improved.map((x) => (
                  <p key={x.category} className="text-xs text-ink">
                    Llevas {x.streak} prácticas sin repetir{" "}
                    <span className="font-semibold text-ink-bright">{x.label}</span>.
                  </p>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">Lo hiciste bien</div>
                <p className="text-ink">{debrief.wins}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-warning">Para pulir</div>
                <p className="text-ink">{debrief.improve}</p>
                {debrief.focus && debrief.focus.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {debrief.focus.map((f) => (
                      <span
                        key={f.category}
                        className="rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-muted"
                      >
                        {skillLabel(f.category)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {debrief.phrases?.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Frases útiles</div>
                  <ul className="mt-1 space-y-1">
                    {debrief.phrases.map((p, i) => (
                      <li key={i} className="flex gap-2 text-ink">
                        <span className="text-secondary">›</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-md border border-secondary bg-surface2 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">Ya puedes…</div>
                <p className="text-ink-bright">{debrief.canDo}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href="/home"
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-primary-dim"
              >
                Volver al inicio (+25 XP)
              </Link>
              <button
                type="button"
                onClick={() => setDebrief(null)}
                className="rounded-md border border-line px-4 py-2.5 text-sm text-ink"
              >
                Seguir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
