"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Tutor = {
  id: string;
  slug: string;
  name: string;
  role: string;
  accent: string | null;
  emoji: string | null;
};

const LS = "em_active_tutor";

// Selección de tutor que persiste: en profiles.active_tutor_id si hay sesión,
// en localStorage para invitados.
export function TutorPicker({
  tutors,
  initialActiveId,
}: {
  tutors: Tutor[];
  initialActiveId: string | null;
}) {
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialActiveId) return; // ya vino del servidor (sesión)
    try {
      const v = localStorage.getItem(LS);
      if (v) setActiveId(v);
    } catch {
      /* ignore */
    }
  }, [initialActiveId]);

  async function choose(id: string) {
    setActiveId(id);
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) await supabase.from("profiles").update({ active_tutor_id: id }).eq("id", user.id);
      else localStorage.setItem(LS, id);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {tutors.map((t) => {
          const active = t.id === activeId;
          return (
            <div
              key={t.id}
              className={
                "rounded-lg border bg-surface p-4 transition " +
                (active ? "border-primary" : "border-line")
              }
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-surface3 text-2xl">
                  {t.emoji ?? "🧑‍🏫"}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-ink-bright">{t.name}</p>
                  <p className="truncate text-xs text-ink-muted">{t.role}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="truncate rounded-full border border-line px-2 py-0.5 text-xs text-ink-muted">
                  {t.accent ?? ""}
                </span>
                <button
                  type="button"
                  onClick={() => choose(t.id)}
                  disabled={saving}
                  className={
                    "flex-none rounded-md px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 " +
                    (active
                      ? "bg-secondary text-bg"
                      : "bg-primary text-white hover:bg-primary-dim")
                  }
                >
                  {active ? "✓ Tu tutor" : "Elegir"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <Link
          href="/sesion"
          className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
        >
          Empezar a practicar
        </Link>
      </div>
    </>
  );
}
