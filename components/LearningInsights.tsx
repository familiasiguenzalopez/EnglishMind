"use client";

import { useEffect, useState } from "react";
import { loadInsights, type Insight } from "@/lib/learnlog";

// "Tu hilo de aprendizaje": qué patrones trabaja ahora el alumno y cuáles va
// superando. Se nutre de los focos registrados en conversación y escritura.
export function LearningInsights() {
  const [data, setData] = useState<{
    working: Insight[];
    improving: Insight[];
    totalSessions: number;
  } | null>(null);

  useEffect(() => {
    loadInsights().then(setData);
  }, []);

  if (!data) return null;

  const { working, improving, totalSessions } = data;

  return (
    <section className="mt-8 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink-bright">
          Tu hilo de aprendizaje
        </h2>
        <span className="text-xs text-ink-dim">{totalSessions} prácticas</span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        Llevamos el control de tus correcciones para alentarte cuando dejas de repetir un error.
      </p>

      {totalSessions === 0 ? (
        <p className="mt-4 rounded-md border border-line bg-surface2 px-3 py-3 text-sm text-ink-muted">
          Practica conversación o escritura (con sesión iniciada) y aquí verás en qué mejorar y cuánto avanzas. 💪
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {improving.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-secondary">
                ✅ Vas superando
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {improving.map((x) => (
                  <span
                    key={x.category}
                    className="inline-flex items-center gap-1.5 rounded-full border border-secondary bg-surface2 px-3 py-1.5 text-xs text-ink-bright"
                  >
                    {x.label}
                    <span className="text-secondary">· {x.streak} prácticas sin repetir</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-warning">
              🎯 En lo que trabajas ahora
            </div>
            {working.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {working.map((x) => (
                  <span
                    key={x.category}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs text-ink"
                  >
                    {x.label}
                    {x.count > 1 && <span className="text-ink-dim">· {x.count}×</span>}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">
                ¡Sin focos recientes! Sigue practicando para mantener el ritmo.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
