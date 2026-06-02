"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { blobToWav16k, bytesToBase64 } from "@/lib/wav";
import { award } from "@/lib/gamify";

const SENTENCES = [
  "I would like to improve my English to get a better job.",
  "Thank you for calling. How can I help you today?",
  "Could you transfer my call to technical support, please?",
  "I have an appointment with the doctor at three o'clock.",
];

type WordScore = { word: string; accuracy: number | null; error: string };
type Result = {
  recognized: string;
  pron: number | null;
  accuracy: number | null;
  fluency: number | null;
  completeness: number | null;
  words: WordScore[];
};

function tone(v: number | null) {
  if (v == null) return "text-ink-muted";
  if (v >= 80) return "text-success";
  if (v >= 60) return "text-warning";
  return "text-danger";
}

export function AzurePronunciation() {
  const [refIdx, setRefIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const reference = SENTENCES[refIdx];

  async function start() {
    setError(null);
    setResult(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Necesito permiso del micrófono.");
      return;
    }
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      setProcessing(true);
      try {
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        const wav = await blobToWav16k(blob);
        const b64 = bytesToBase64(new Uint8Array(await wav.arrayBuffer()));
        const supabase = createClient();
        const { data, error } = await supabase.functions.invoke("pronunciation", {
          body: { audio: b64, reference },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setResult(data as Result);
        if ((data?.pron ?? 0) >= 70) {
          award(15, { id: "azure-pron", label: "Pronunciación clara (score real)" });
        }
      } catch {
        setError("No se pudo evaluar. Intenta de nuevo, hablando claro y cerca del micrófono.");
      } finally {
        setProcessing(false);
      }
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    // Seguro: corta a los 15s
    setTimeout(() => {
      if (recRef.current && recRef.current.state === "recording") recRef.current.stop();
    }, 15000);
  }

  function stop() {
    recRef.current?.stop();
  }

  return (
    <section className="rounded-lg border border-primary bg-surface p-5">
      <div className="text-[11px] font-bold uppercase tracking-wide text-primary">
        Lectura evaluada · score real (Azure)
      </div>
      <p className="mt-2 text-lg text-ink-bright">{reference}</p>
      <button
        type="button"
        onClick={() => {
          setRefIdx((i) => (i + 1) % SENTENCES.length);
          setResult(null);
          setError(null);
        }}
        className="mt-1 text-xs text-ink-muted underline hover:text-ink"
      >
        otra frase
      </button>

      <div className="mt-3">
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={processing}
          className={
            "inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-bold transition disabled:opacity-40 " +
            (recording ? "bg-danger text-white" : "bg-primary text-white hover:bg-primary-dim")
          }
        >
          <span className={"h-2.5 w-2.5 rounded-full " + (recording ? "animate-pulse bg-white" : "bg-white/80")} />
          {processing ? "Evaluando…" : recording ? "Detener" : "🎤 Leer en voz alta"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-warning">{error}</p>}

      {result && (
        <div className="mt-4">
          <div className="flex items-end gap-2">
            <span className={"font-display text-4xl font-extrabold " + tone(result.pron)}>
              {Math.round(result.pron ?? 0)}
            </span>
            <span className="mb-1 text-sm text-ink-muted">/ 100 pronunciación</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { l: "Precisión", v: result.accuracy },
              { l: "Fluidez", v: result.fluency },
              { l: "Completitud", v: result.completeness },
            ].map((m) => (
              <div key={m.l} className="rounded-md border border-line bg-surface2 p-2">
                <div className="text-ink-muted">{m.l}</div>
                <div className={"font-display text-lg font-bold " + tone(m.v)}>
                  {Math.round(m.v ?? 0)}
                </div>
              </div>
            ))}
          </div>

          {result.words.length > 0 && (
            <p className="mt-4 leading-relaxed">
              {result.words.map((w, i) => (
                <span
                  key={i}
                  className={
                    "mr-1 " +
                    (w.error === "Omission"
                      ? "text-ink-dim line-through"
                      : tone(w.accuracy))
                  }
                  title={w.accuracy != null ? `${Math.round(w.accuracy)} · ${w.error}` : w.error}
                >
                  {w.word}
                </span>
              ))}
            </p>
          )}

          <p className="mt-3 text-xs text-ink-dim">
            Toca una palabra para ver su puntaje. Verde = claro · ámbar = por
            mejorar · rojo = no se entendió · tachado = no se dijo.
          </p>
        </div>
      )}
    </section>
  );
}
