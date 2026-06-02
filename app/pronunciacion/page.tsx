"use client";

import { useEffect, useState } from "react";
import { PronunciationScore, type PronStatus } from "@/components/ui/PronunciationScore";
import { award } from "@/lib/gamify";
import { loadSoundMap, recordSound } from "@/lib/soundmap";
import { AzurePronunciation } from "@/components/AzurePronunciation";

// Práctica de pronunciación con pares mínimos (prioridad para hispanohablantes).
// v1 credential-free: speechSynthesis = modelo nativo; SpeechRecognition =
// escucha tu intento y lo compara contra el par. (El scoring fonémico fino con
// Azure llega después.)

type Sound = {
  id: string;
  label: string;
  note: string;
  tip: string;
  pairs: [string, string][];
};

const SOUNDS: Sound[] = [
  {
    id: "i",
    label: "/ɪ/ vs /iː/",
    note: "Vocal corta vs. larga — el error nº 1.",
    tip: "Para /ɪ/ (ship) relaja y acorta la lengua; para /iː/ (sheep) estírala y casi sonríe.",
    pairs: [["ship", "sheep"], ["bit", "beat"], ["live", "leave"], ["it", "eat"]],
  },
  {
    id: "bv",
    label: "/b/ vs /v/",
    note: "El español los funde en uno solo.",
    tip: "Para /v/ (very) muerde suave el labio inferior con los dientes; /b/ (berry) junta los dos labios.",
    pairs: [["berry", "very"], ["boat", "vote"], ["best", "vest"]],
  },
  {
    id: "th",
    label: "/θ/ (think)",
    note: "No existe en español.",
    tip: "Saca un poco la lengua entre los dientes y sopla: think, not sink.",
    pairs: [["think", "sink"], ["thin", "sin"], ["three", "tree"]],
  },
  {
    id: "sh",
    label: "/ʃ/ vs /tʃ/",
    note: "sheep vs. cheap.",
    tip: "/ʃ/ es un soplo continuo (sh…); /tʃ/ empieza con un toque de lengua (ch).",
    pairs: [["sheep", "cheap"], ["ship", "chip"], ["share", "chair"]],
  },
  {
    id: "ae",
    label: "/æ/ vs /e/",
    note: "bad vs. bed — el español no tiene /æ/.",
    tip: "Para /æ/ (bad) abre más la boca, casi entre 'a' y 'e'; /e/ (bed) es tu 'e' normal.",
    pairs: [["bad", "bed"], ["man", "men"], ["bat", "bet"], ["sad", "said"]],
  },
];

const clean = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

export default function Pronunciacion() {
  const [sound, setSound] = useState<Sound>(SOUNDS[0]);
  const [target, setTarget] = useState<{ word: string; partner: string }>({
    word: SOUNDS[0].pairs[0][0],
    partner: SOUNDS[0].pairs[0][1],
  });
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<{ kind: PronStatus; heard: string } | null>(null);
  const [supported, setSupported] = useState(true);
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    loadSoundMap().then(setMap);
  }, []);

  function pick(sound: Sound, word: string, partner: string) {
    setSound(sound);
    setTarget({ word, partner });
    setResult(null);
  }

  function speak(word: string, slow = false) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = slow ? 0.6 : 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function listen() {
    const w = window as unknown as Record<string, any>;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    setListening(true);
    setResult(null);
    rec.onresult = (e: any) => {
      const alts: string[] = [];
      const r = e.results[0];
      for (let i = 0; i < r.length; i++) alts.push(clean(String(r[i].transcript)));
      const t = clean(target.word);
      const p = clean(target.partner);
      let kind: PronStatus;
      let heard: string;
      if (alts.some((a) => a === t)) {
        kind = "correct";
        heard = alts[0];
        award(15, { id: "first-clear-sound", label: "Tu primer sonido claro" });
      } else if (alts.some((a) => a === p)) {
        kind = "improve";
        heard = target.partner;
      } else {
        kind = "unintelligible";
        heard = alts[0] ?? "";
      }
      setResult({ kind, heard });
      void recordSound(sound.id, kind, scoreValue[kind]);
      setMap((prev) => {
        const rank: Record<PronStatus, number> = { correct: 3, improve: 2, unintelligible: 1 };
        const cur = prev[sound.id] as PronStatus | undefined;
        if (!cur || rank[kind] > rank[cur]) return { ...prev, [sound.id]: kind };
        return prev;
      });
    };
    rec.onerror = () => {
      setListening(false);
      setResult({ kind: "unintelligible", heard: "" });
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }

  const scoreValue = { correct: 95, improve: 55, unintelligible: 20 } as const;

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Mapa de sonidos
      </h1>
      <p className="mt-2 text-ink-muted">
        La meta es que te entiendan, no sonar gringo. Escucha el modelo y repítelo;
        te digo si sonó claro.
      </p>

      <div className="mt-5">
        <AzurePronunciation />
      </div>

      {/* Mapa de sonidos (tu progreso, persistente) */}
      <div className="mt-5 rounded-lg border border-line bg-surface2 p-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Tu mapa de sonidos
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {SOUNDS.map((s) => {
            const st = map[s.id];
            const color =
              st === "correct"
                ? "bg-success"
                : st === "improve"
                  ? "bg-warning"
                  : "bg-surface3";
            return (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-1 text-xs text-ink"
              >
                <span className={"h-2 w-2 rounded-full " + color} />
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Sonidos */}
      <div className="mt-5 flex flex-wrap gap-2">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => pick(s, s.pairs[0][0], s.pairs[0][1])}
            className={
              "rounded-full border px-3 py-1.5 text-sm font-semibold transition " +
              (s.id === sound.id
                ? "border-primary bg-primary/10 text-ink-bright"
                : "border-line bg-surface2 text-ink-muted hover:text-ink")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-ink-muted">{sound.note}</p>

      {/* Pares mínimos */}
      <div className="mt-4 space-y-2">
        {sound.pairs.map(([a, b]) => (
          <div key={a + b} className="flex gap-2">
            {[
              [a, b],
              [b, a],
            ].map(([word, partner]) => (
              <button
                key={word}
                type="button"
                onClick={() => pick(sound, word, partner)}
                className={
                  "flex-1 rounded-md border px-3 py-2.5 text-center text-sm font-semibold transition " +
                  (target.word === word
                    ? "border-primary bg-surface2 text-ink-bright"
                    : "border-line bg-surface text-ink hover:border-primary/60")
                }
              >
                {word}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Controles del objetivo */}
      <div className="mt-6 rounded-lg border border-line bg-surface p-4">
        <div className="text-xs text-ink-muted">Practicando</div>
        <div className="font-display text-2xl font-extrabold text-ink-bright">
          {target.word}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => speak(target.word)}
            className="rounded-md bg-surface2 px-3 py-2 text-sm font-semibold text-ink hover:text-ink-bright"
          >
            🔊 Escuchar
          </button>
          <button
            type="button"
            onClick={() => speak(target.word, true)}
            className="rounded-md bg-surface2 px-3 py-2 text-sm font-semibold text-ink hover:text-ink-bright"
          >
            🐢 Lento
          </button>
          <button
            type="button"
            onClick={listen}
            disabled={listening || !supported}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
          >
            {listening ? "Escuchando…" : "🎤 Pronúncialo"}
          </button>
        </div>

        {result && (
          <div className="mt-4">
            <PronunciationScore status={result.kind} value={scoreValue[result.kind]} />
            {result.kind !== "correct" && result.heard && (
              <p className="mt-1 text-xs text-ink-dim">Escuché: “{result.heard}”</p>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-ink-muted">💡 {sound.tip}</p>
      </div>

      {!supported && (
        <p className="mt-4 rounded-md border border-warning bg-surface2 px-3 py-2 text-sm text-warning">
          Tu navegador no soporta el micrófono para esto. Igual puedes escuchar el
          modelo y repetirlo en voz alta — funciona mejor en Chrome.
        </p>
      )}
    </main>
  );
}
