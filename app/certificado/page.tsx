"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { CefrBadge, type CefrLevel } from "@/components/ui/CefrBadge";

const VALID = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function Certificado() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata ?? {};
          setName(
            (meta.full_name as string) ||
              (meta.name as string) ||
              user.email ||
              "Estudiante",
          );
          const { data: prof } = await supabase
            .from("profiles")
            .select("cefr_level")
            .eq("id", user.id)
            .single();
          setLevel((prof?.cefr_level as string | null) ?? null);
        }
      } catch {
        /* invitado */
      }
      setLoading(false);
    })();
  }, []);

  async function issue() {
    setIssuing(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("issue_certificate", {
        p_name: name ?? null,
      });
      if (error) throw error;
      setPublicId(String(data));
    } catch {
      setError("No se pudo emitir el certificado. Intenta de nuevo.");
    } finally {
      setIssuing(false);
    }
  }

  const verifyUrl =
    publicId && typeof window !== "undefined"
      ? `${window.location.origin}/verify/${publicId}`
      : "";
  const badgeLevel = (VALID.includes(level ?? "") ? level : "A1") as CefrLevel;

  return (
    <main className="mx-auto max-w-xl px-5 pt-12 pb-28">
      <h1 className="font-display text-3xl font-extrabold text-ink-bright">
        Tu certificado
      </h1>
      <p className="mt-2 text-ink-muted">
        Un <strong>EnglishMind Proficiency Statement</strong>, alineado al
        MCER/CEFR: una credencial de progreso <strong>verificable</strong>. No es
        un examen oficial acreditado.
      </p>

      {loading ? (
        <p className="mt-6 text-ink-muted">Cargando…</p>
      ) : !name ? (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <p className="text-ink">Inicia sesión para emitir tu certificado.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            Iniciar sesión
          </Link>
        </div>
      ) : publicId ? (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <CefrBadge level={badgeLevel} />
            <span className="font-display font-bold text-ink-bright">{name}</span>
          </div>
          <p className="mt-1 text-sm text-secondary">¡Certificado emitido! 🎉</p>
          <div className="mt-4 inline-block rounded-lg bg-white p-3">
            <QRCodeSVG value={verifyUrl} size={168} />
          </div>
          <p className="mt-3 break-all text-xs text-ink-muted">{verifyUrl}</p>
          <Link
            href={`/verify/${publicId}`}
            className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
          >
            Abrir verificación
          </Link>
          <p className="mt-3 text-xs text-ink-dim">
            Comparte el enlace o el QR; cualquiera puede verificarlo sin cuenta.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-line bg-surface p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <CefrBadge level={badgeLevel} />
            <span className="font-display font-bold text-ink-bright">{name}</span>
          </div>
          {!level && (
            <p className="mt-2 text-xs text-warning">
              Aún no tienes nivel evaluado.{" "}
              <Link href="/placement" className="underline">
                Haz el placement
              </Link>{" "}
              para un nivel más preciso (mientras, será A1).
            </p>
          )}
          <button
            type="button"
            onClick={issue}
            disabled={issuing}
            className="mt-4 inline-block rounded-md bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dim disabled:opacity-40"
          >
            {issuing ? "Generando…" : "Generar mi certificado"}
          </button>
          {error && <p className="mt-3 text-sm text-warning">{error}</p>}
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-ink-dim">
        Mide 4 habilidades por separado y se ancla a descriptores can-do. La
        página de verificación dice claramente qué es y qué no es, con un
        mini-mapeo legible para reclutadores (p. ej. B1 ≈ sostiene una
        conversación de trabajo).
      </p>
    </main>
  );
}
