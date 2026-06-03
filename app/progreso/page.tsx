"use client";

import { useEffect, useRef, useState } from "react";
import { award } from "@/lib/gamify";
import { createClient } from "@/lib/supabase/client";
import { blobToWav16k, bytesToBase64 } from "@/lib/wav";
import { LearningInsights } from "@/components/LearningInsights";
import { ProgressRadar } from "@/components/ProgressRadar";

// "Tu progreso, en tu propia voz" (Lote 1 · #6).
// Graba con MediaRecorder y guarda EN EL DISPOSITIVO (localStorage), opt-in.
// "Comparar con IA": convierte antes/ahora a WAV y los manda a Gemini para
// describir el avance (solo en ese momento; no se almacena).

const PROMPT = "Tell me about your job — háblame de tu trabajo (30 seg).";
const KEY = "em_capsules_v1";

type Capsule = { id: string; ts: number; dataUrl: string };

function fmt(ts: number) {
  try {
    return new Date(ts).toLocaleString("es", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onloadend = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

export default function Progreso() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setSupported(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices &&
        typeof window !== "undefined" &&
        "MediaRecorder" in window,
    );
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCapsules(JSON.parse(raw) as Capsule[]);
    } catch {
      /* ignore */
    }
  }, []);

  function persist(list: Capsule[]) {
    setCapsules(list);
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      setError("No se pudo guardar (espacio del dispositivo lleno).");
    }
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const dataUrl = await blobToDataUrl(blob);
        const cap: Capsule = { id: crypto.randomUUID(), ts: Date.now(), dataUrl };
        const next = [...capsules, cap].sort((a, b) => a.ts - b.ts);
        persist(next);
        setAnalysis(null);
        award(
          20,
          capsules.length === 0
            ? { id: "first-capsule", label: "Tu primera cápsula de voz" }
            : undefined,
        );
        stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setError("Necesito permiso del micrófono. Revisa los permisos del navegador.");
      setRecording(false);
    }
  }

  function stop() {
    recRef.current?.stop();
    setRecording(false);
  }

  function remove(id: string) {
    persist(capsules.filter((c) => c.id !== id));
  }

  async function compare(oldCap: Capsule, newCap: Capsule) {
    setComparing(true);
    setAnalysis(null);
    try {
      const toWavB64 = async (dataUrl: string) => {
        const blob = await (await fetch(dataUrl)).blob();
        const wav = await blobToWav16k(blob);
        return bytesToBase64(new Uint8Array(await wav.arrayBuffer()));
      };
      const [audioOld, audioNew] = await Promise.all([
        toWavB64(oldCap.dataUrl),
        toWavB64(newCap.dataUrl),
      ]);
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("progress-compare", {
        body: { audioOld, audioNew },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis((data.analysis as string) ?? "");
    } catch {
      setAnalysis("No pudimos comparar ahora. Intenta de nuevo en un momento.");
    } finally {
      setComparing(false);
    }
  }

  const sorted = [...capsules].sort((a, b) => a.ts - b.ts);
  const entonces = sorted[0];
  const ahora = sorted.length > 1 ? sorted[sorted.length - 1] : undefined;

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Tu progreso, en tu propia voz
      </h1>
      <p className="mt-2 text-ink-muted">
        La mejor prueba de avance es oírte a ti mismo de antes. Graba la misma
        frase cada cierto tiempo y escucha cuánto avanzaste.
      </p>

      <ProgressRadar />

      <LearningInsights />

      {/* Prompt fijo + grabar */}
      <div className="mt-6 rounded-lg border border-line bg-surface p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-secondary">
          Tu frase de referencia
        </div>
        <p className="mt-1 text-lg text-ink-bright">{PROMPT}</p>
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={!supported}
          className={
            "mt-4 inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-bold transition disabled:opacity-40 " +
            (recording ? "bg-danger text-white" : "bg-primary text-white hover:bg-primary-dim")
          }
        >
          <span
            className={
              "h-2.5 w-2.5 rounded-full " + (recording ? "animate-pulse bg-white" : "bg-white/80")
            }
          />
          {recording ? "Detener" : "🎙️ Grabar mi voz"}
        </button>
        {!supported && (
          <p className="mt-3 text-sm text-warning">
            Tu navegador no soporta grabación. Funciona en Chrome (móvil o escritorio).
          </p>
        )}
        {error && <p className="mt-3 text-sm text-warning">{error}</p>}
      </div>

      {/* Entonces vs ahora */}
      {entonces && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-ink-bright">
            Entonces vs. ahora
          </h2>
          {ahora ? (
            <>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Entonces", cap: entonces },
                  { label: "Ahora", cap: ahora },
                ].map(({ label, cap }) => (
                  <div key={cap.id} className="rounded-lg border border-line bg-surface2 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-secondary">
                      {label}
                    </div>
                    <div className="text-xs text-ink-muted">{fmt(cap.ts)}</div>
                    <audio controls src={cap.dataUrl} className="mt-2 w-full" />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => compare(entonces, ahora)}
                disabled={comparing}
                className="mt-3 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
              >
                {comparing ? "Comparando…" : "✨ Comparar con IA"}
              </button>
              {analysis && (
                <div className="mt-3 rounded-lg border border-secondary bg-surface2 p-4 text-sm text-ink">
                  {analysis}
                </div>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">
              Esta es tu primera cápsula. Graba otra más adelante y aquí verás cuánto
              avanzaste. 💪
            </p>
          )}
        </div>
      )}

      {/* Lista de cápsulas */}
      {sorted.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
            Tus cápsulas ({sorted.length})
          </h2>
          <div className="mt-3 space-y-3">
            {sorted.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-ink-muted">{fmt(c.ts)}</div>
                  <audio controls src={c.dataUrl} className="mt-1 w-full" />
                </div>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="flex-none rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-muted hover:border-danger hover:text-danger"
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacidad por diseño */}
      <div className="mt-8 rounded-lg border border-line bg-surface2 p-4 text-xs leading-relaxed text-ink-dim">
        <strong className="text-ink-muted">Privacidad por diseño.</strong> Tus
        grabaciones se guardan <strong>solo en este dispositivo</strong> y puedes
        borrarlas cuando quieras. Si pulsas <strong>“Comparar con IA”</strong>, esas
        dos grabaciones se envían al modelo <strong>solo en ese momento</strong> para
        describir tu avance; no se almacenan ni se usan para nada más. La comparación
        es siempre contra tu yo anterior — nunca contra otros, ni para burlarse del
        pasado.
      </div>
    </main>
  );
}
