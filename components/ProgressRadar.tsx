"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadState } from "@/lib/gamify";
import { SkillRadar } from "@/components/SkillRadar";

// "Tu dominio" (estilo ELSA): radar de 5 destrezas estimado según lo practicado,
// + logros. Sin tabla de líderes (chocaría con "medir sin vigilar").
const ACH: Record<string, string> = {
  "first-conversation": "Hablaste con tu tutor",
  "lesson-done": "Completaste lecciones",
  "azure-pron": "Pronunciación clara",
  "first-clear-sound": "Primer sonido claro",
  "first-review": "Tu primer repaso",
  "first-capsule": "Tu primera cápsula de voz",
};

export function ProgressRadar() {
  const [radar, setRadar] = useState<{ label: string; value: number }[] | null>(null);
  const [achs, setAchs] = useState<string[]>([]);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const {
          data: { user },
        } = await sb.auth.getUser();
        const st = await loadState();
        setAchs(st.achievements ?? []);
        const counts: Record<string, number> = { scenario: 0, pronunciation: 0, writing: 0, vocab: 0 };
        let total = 0;
        if (user) {
          const { data: prog } = await sb
            .from("progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("status", "done");
          const ids = (prog ?? []).map((p: { lesson_id: string }) => p.lesson_id);
          total = ids.length;
          if (ids.length) {
            const { data: ls } = await sb.from("lessons").select("kind").in("id", ids);
            (ls ?? []).forEach((l: { kind: string }) => {
              if (l.kind in counts) counts[l.kind] += 1;
            });
          }
        } else {
          setGuest(true);
        }
        const n = (c: number) => Math.min(100, c * 25);
        setRadar([
          { label: "Conver.", value: n(counts.scenario) },
          { label: "Pronun.", value: n(counts.pronunciation) },
          { label: "Vocab.", value: n(counts.vocab) },
          { label: "Escrit.", value: n(counts.writing) },
          { label: "Fluidez", value: Math.min(100, total * 8) },
        ]);
      } catch {
        setRadar([
          { label: "Conver.", value: 0 },
          { label: "Pronun.", value: 0 },
          { label: "Vocab.", value: 0 },
          { label: "Escrit.", value: 0 },
          { label: "Fluidez", value: 0 },
        ]);
      }
    })();
  }, []);

  if (!radar) return null;

  return (
    <section className="mt-8 rounded-lg border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-extrabold text-ink-bright">Tu dominio</h2>
      <p className="mt-1 text-xs text-ink-muted">
        Estimado según lo que practicas en cada destreza. Crece con cada lección.
      </p>
      <div className="mt-2">
        <SkillRadar values={radar} />
      </div>
      {guest && (
        <p className="text-center text-xs text-ink-dim">Inicia sesión para guardar y ver tu progreso real.</p>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">Logros ({achs.length})</div>
        {achs.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {achs.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full border border-secondary bg-surface2 px-2.5 py-1 text-xs text-ink-bright"
              >
                🏅 {ACH[a] ?? a}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-ink-dim">
            Aún no tienes logros. Completa una práctica para ganar el primero. 🏅
          </p>
        )}
      </div>
    </section>
  );
}
