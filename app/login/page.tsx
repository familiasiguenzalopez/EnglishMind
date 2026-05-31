"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function google() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6">
      <div className="mb-6 flex items-center gap-3">
        <span
          className="h-3.5 w-3.5 rounded-[4px]"
          style={{
            background:
              "linear-gradient(135deg,var(--color-primary),var(--color-secondary))",
          }}
        />
        <span className="font-display text-xl font-extrabold text-ink-bright">
          EnglishMind AI
        </span>
      </div>

      <h1 className="font-display text-2xl font-extrabold text-ink-bright">
        Tu inglés te abre puertas
      </h1>
      <p className="mt-2 text-ink-muted">
        Entra para guardar tu progreso. No necesitas saber nada todavía — vamos a
        tu ritmo.
      </p>

      <button
        type="button"
        onClick={google}
        disabled={loading}
        className="mt-6 flex items-center justify-center gap-2 rounded-md border border-line bg-surface px-5 py-3 text-sm font-bold text-ink-bright transition hover:border-primary disabled:opacity-50"
      >
        {loading ? "Conectando…" : "Continuar con Google"}
      </button>

      {error && <p className="mt-3 text-sm text-warning">{error}</p>}

      <p className="mt-4 text-xs text-ink-dim">
        Solo usamos tu cuenta para guardar tu progreso. Tu voz y tus datos son
        tuyos.
      </p>
    </main>
  );
}
