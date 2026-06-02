"use client";

import { useEffect, useState } from "react";
import { loadTutorPrefs, saveTutorPrefs, type TutorPrefs as Prefs } from "@/lib/tutorPrefs";

const ACCENTS = [
  { v: "en-US", l: "Estadounidense 🇺🇸" },
  { v: "en-GB", l: "Británico 🇬🇧" },
  { v: "en-AU", l: "Australiano 🇦🇺" },
];
const TONES = ["Cercano", "Profesional", "Directo"];

export function TutorPrefs() {
  const [p, setP] = useState<Prefs | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadTutorPrefs().then(setP);
  }, []);

  function update(patch: Partial<Prefs>) {
    setP((prev) => {
      const next = { ...(prev as Prefs), ...patch };
      void saveTutorPrefs(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function preview(accent: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance("Hi! Let's practice your English together.");
    const vs = window.speechSynthesis.getVoices();
    const v = vs.find((x) => x.lang === accent) || vs.find((x) => x.lang.startsWith(accent.slice(0, 2)));
    if (v) u.voice = v;
    u.lang = accent;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  if (!p) return null;

  return (
    <div className="mt-6 rounded-lg border border-line bg-surface p-5">
      <div className="font-display font-bold text-ink-bright">Personaliza tu tutor</div>
      <p className="mt-1 text-xs text-ink-muted">Aplica a tus prácticas. Toca un acento para escucharlo.</p>

      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        Acento del inglés
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        {ACCENTS.map((a) => (
          <button
            key={a.v}
            type="button"
            onClick={() => {
              update({ accent: a.v });
              preview(a.v);
            }}
            className={
              "rounded-full border px-3 py-1.5 text-sm transition " +
              (p.accent === a.v
                ? "border-primary bg-surface2 text-ink-bright"
                : "border-line text-ink-muted hover:text-ink")
            }
          >
            {a.l}
          </button>
        ))}
      </div>

      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Tono</div>
      <div className="mt-1 flex flex-wrap gap-2">
        {TONES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => update({ tone: t })}
            className={
              "rounded-full border px-3 py-1.5 text-sm transition " +
              (p.tone === t
                ? "border-primary bg-surface2 text-ink-bright"
                : "border-line text-ink-muted hover:text-ink")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => update({ autoplay: !p.autoplay })}
        className="mt-4 flex w-full items-center justify-between rounded-md border border-line bg-surface2 px-3 py-2 text-sm"
      >
        <span className="text-ink">Reproducir la voz automáticamente</span>
        <span
          className={
            "relative h-5 w-9 flex-none rounded-full border transition " +
            (p.autoplay ? "border-secondary bg-secondary" : "border-line bg-surface3")
          }
        >
          <span
            className={
              "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all " +
              (p.autoplay ? "left-[18px]" : "left-0.5")
            }
          />
        </span>
      </button>

      <div className="mt-2 h-4 text-xs text-secondary">{saved ? "Guardado ✓" : ""}</div>
    </div>
  );
}
