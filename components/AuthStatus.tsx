"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Muestra el estado de sesión: usuario + "Salir", o un enlace a "Iniciar sesión".
export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoaded(true);
    });
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!loaded) return <span className="text-xs text-ink-dim">·</span>;

  return email ? (
    <div className="flex items-center gap-2 text-xs">
      <span className="max-w-[160px] truncate text-ink-muted">{email}</span>
      <button
        type="button"
        onClick={logout}
        className="rounded-md border border-line px-2 py-1 font-semibold text-ink hover:border-primary"
      >
        Salir
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="rounded-md border border-line px-3 py-1 text-xs font-semibold text-ink hover:border-primary"
    >
      Iniciar sesión
    </Link>
  );
}
