"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SceneCharacter, type CharState } from "@/components/scene/SceneCharacter";
import { SceneBackground } from "@/components/scene/SceneBackground";
import { getScene } from "@/lib/scenes";
import { LOOKS, loadLook, saveLook, DEFAULT_LOOK, type AvatarLook } from "@/lib/avatar";
import { loadTutorPrefs, saveTutorPrefs } from "@/lib/tutorPrefs";

// Onboarding inmersivo (estilo ELSA): flujo guiado por la mascota/personaje, con
// fondo ambientado por paso, micro-animaciones y preview de voz. Reusa la
// persistencia existente: objetivo (profiles.goal), tutor (tutorPrefs), avatar (look).
type Route = { slug: string; name: string; description: string | null };

const ROUTE_EMOJI: Record<string, string> = {
  "call-center": "🎧",
  "trabajo-remoto": "💻",
  entrevista: "💼",
  migracion: "🧭",
  cotidiano: "🌎",
  certificacion: "📜",
};
const ACCENTS = [
  { v: "en-US", l: "🇺🇸 Estadounidense" },
  { v: "en-GB", l: "🇬🇧 Británico" },
  { v: "en-AU", l: "🇦🇺 Australiano" },
];
const TONES = ["Cercano", "Profesional", "Directo"];
const STEP_SCENE = ["tutor", "office", "cafe", "shopping", "tutor"];

const chip = (active: boolean) =>
  "rounded-full border px-3.5 py-2 text-sm font-semibold transition " +
  (active
    ? "border-primary bg-surface2 text-ink-bright"
    : "border-line bg-surface text-ink-muted hover:text-ink");

export function OnboardingFlow({ routes }: { routes: Route[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [accent, setAccent] = useState("en-US");
  const [tone, setTone] = useState("Cercano");
  const [look, setLook] = useState<AvatarLook>(DEFAULT_LOOK);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLook(loadLook());
    loadTutorPrefs().then((p) => {
      setAccent(p.accent);
      setTone(p.tone);
    });
  }, []);

  const total = 5;
  const scene = getScene(STEP_SCENE[step] ?? "tutor")!;
  const charState: CharState = step === 0 || step === 4 ? "speaking" : "idle";

  const bubble = [
    "¡Hola! 👋 Soy tu compañero de práctica. En menos de un minuto dejamos tu inglés a tu medida.",
    "¿Por qué quieres aprender inglés? Elige lo que más te importa ahora — no hay respuesta incorrecta.",
    "¿Cómo quieres que suene y se sienta tu tutor? Toca un acento para escucharlo.",
    "Ahora diséñame a mí. ¿Qué estilo te gusta?",
    "¡Listo! Armé tu camino a tu medida. ¿Empezamos? 🎉",
  ][step];

  function preview(a: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance("Hi! Let's practice your English together.");
    const vs = window.speechSynthesis.getVoices();
    const v = vs.find((x) => x.lang === a) || vs.find((x) => x.lang.startsWith(a.slice(0, 2)));
    if (v) u.voice = v;
    u.lang = a;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function finish() {
    if (busy) return;
    setBusy(true);
    try {
      saveLook(look.id);
      await saveTutorPrefs({ accent, tone, autoplay: true });
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user && goal) await sb.from("profiles").update({ goal }).eq("id", user.id);
    } catch {
      /* invitado / sin red: igual seguimos */
    }
    router.push("/aprender");
  }

  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-xl flex-col overflow-hidden px-5 pt-8 pb-8">
      <SceneBackground scene={scene} />

      {/* Progreso */}
      <div className="relative flex items-center justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={
              "h-1.5 rounded-full transition-all " +
              (i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-secondary" : "w-3 bg-surface3")
            }
          />
        ))}
      </div>

      {/* Personaje + burbuja */}
      <div className="relative mt-4 flex flex-col items-center">
        <SceneCharacter scene={scene} state={charState} look={look} size={120} />
        <div
          key={"b" + step}
          className="em-step mt-3 max-w-sm rounded-2xl border border-line bg-surface px-4 py-3 text-center text-sm text-ink"
        >
          {bubble}
        </div>
      </div>

      {/* Contenido del paso */}
      <div key={step} className="em-step relative mt-5 flex-1">
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {routes.map((r) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => setGoal(r.slug)}
                className={
                  "rounded-lg border p-4 text-left transition " +
                  (goal === r.slug
                    ? "border-primary bg-surface2"
                    : "border-line bg-surface hover:border-primary")
                }
              >
                <div className="text-2xl">{ROUTE_EMOJI[r.slug] ?? "✨"}</div>
                <div className="mt-1 font-display font-bold text-ink-bright">{r.name}</div>
                {r.description && <div className="mt-0.5 text-xs text-ink-muted">{r.description}</div>}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Acento</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.v}
                    type="button"
                    onClick={() => {
                      setAccent(a.v);
                      preview(a.v);
                    }}
                    className={chip(accent === a.v)}
                  >
                    {a.l}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-dim">Toca un acento para escucharlo 🔊</p>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Tono</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button key={t} type="button" onClick={() => setTone(t)} className={chip(tone === t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap justify-center gap-2">
            {LOOKS.map((l) => (
              <button key={l.id} type="button" onClick={() => setLook(l)} className={chip(look.id === l.id)}>
                <span
                  className="mr-1.5 inline-block h-3.5 w-3.5 rounded-full align-middle"
                  style={{ background: l.skin, boxShadow: `inset 0 0 0 2px ${l.hair}` }}
                />
                {l.name}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="rounded-lg border border-secondary bg-surface2 p-4 text-sm">
            <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">Tu plan</div>
            <ul className="mt-1.5 space-y-1 text-ink">
              <li>🎯 Objetivo: {routes.find((r) => r.slug === goal)?.name ?? "Inglés general"}</li>
              <li>🗣️ Acento: {ACCENTS.find((a) => a.v === accent)?.l}</li>
              <li>💬 Tono: {tone}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className="relative mt-5 flex items-center justify-between gap-3">
        {step > 0 && step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink-muted hover:text-ink"
          >
            ‹ Atrás
          </button>
        ) : (
          <span />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !goal}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
          >
            {step === 0 ? "Empezar" : "Siguiente"} →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={busy}
            className="flex-1 rounded-md bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
          >
            {busy ? "Preparando tu camino…" : "Empezar a aprender →"}
          </button>
        )}
      </div>

      {step === 0 && (
        <button
          type="button"
          onClick={() => router.push("/aprender")}
          className="relative mt-3 text-center text-xs text-ink-dim hover:text-ink"
        >
          Saltar por ahora
        </button>
      )}
    </main>
  );
}
