"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mascot } from "@/components/Mascot";

// Al entrar al Home como INVITADO, pregunta una vez cómo empezar: crear cuenta
// (guarda progreso) o explorar como invitado. Se muestra solo a invitados y solo
// una vez (localStorage). Los usuarios con sesión no lo ven.
const KEY = "em_welcomed";

export function HomeWelcomeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (localStorage.getItem(KEY)) return;
        const sb = createClient();
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (!user) setShow(true);
      } catch {
        /* si falla, no molestamos */
      }
    })();
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center p-5"
      style={{
        background: "var(--bg)",
        backgroundImage:
          "radial-gradient(900px 540px at 85% -8%, rgba(124,92,255,0.30), transparent 60%), radial-gradient(820px 520px at 0% 0%, rgba(73,168,255,0.20), transparent 55%), radial-gradient(760px 620px at 50% 112%, rgba(255,122,89,0.16), transparent 60%)",
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center">
        <div className="flex justify-center">
          <Mascot state="speaking" size={96} />
        </div>
        <h2 className="mt-2 font-display text-xl font-extrabold text-ink-bright">
          ¡Hola! Soy tu loro 🦜
        </h2>
        <p className="mt-1 text-sm text-ink-muted">¿Cómo quieres empezar a practicar tu inglés?</p>

        <Link
          href="/login"
          onClick={dismiss}
          className="mt-5 block rounded-md bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-dim"
        >
          Crear cuenta gratis
        </Link>
        <p className="mt-1.5 text-[11px] text-ink-dim">
          Guarda tu progreso, tu camino y tu certificado en todos tus dispositivos.
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
        >
          Explorar como invitado
        </button>
        <p className="mt-1.5 text-[11px] text-ink-dim">Puedes crear tu cuenta más tarde sin perder nada.</p>
      </div>
    </div>
  );
}
