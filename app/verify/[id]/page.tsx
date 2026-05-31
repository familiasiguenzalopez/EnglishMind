import { createClient } from "@supabase/supabase-js";

// Página pública de verificación. Sin login. Lee solo campos seguros vía la
// función verify_certificate (el ID es opaco; nada sensible viaja en el QR).
export const dynamic = "force-dynamic";

type VerifyRow = {
  holder_name: string | null;
  global_cefr: string | null;
  skills: Record<string, unknown> | null;
  issued_at: string | null;
  expires_at: string | null;
  status: string; // válido | revocado | expirado
};

const statusStyle: Record<string, string> = {
  "válido": "text-success border-success/40",
  revocado: "text-danger border-danger/40",
  expirado: "text-warning border-warning/40",
};

function fmt(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cert: VerifyRow | undefined;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    const supabase = createClient(url, anon);
    const { data } = await supabase.rpc("verify_certificate", {
      p_public_id: id,
    });
    cert = Array.isArray(data) ? (data[0] as VerifyRow | undefined) : undefined;
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <header className="mb-6 flex items-center gap-3">
        <span
          className="h-3.5 w-3.5 rounded-[4px]"
          style={{
            background:
              "linear-gradient(135deg,var(--color-primary),var(--color-secondary))",
          }}
        />
        <span className="font-display text-lg font-extrabold text-ink-bright">
          EnglishMind AI
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted">
          Verificación
        </span>
      </header>

      {cert ? (
        <div className="rounded-lg border border-line bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-ink-muted">Estado</span>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-bold capitalize ${
                statusStyle[cert.status] ?? "text-ink border-line"
              }`}
            >
              {cert.status}
            </span>
          </div>
          <p className="font-display text-2xl font-extrabold text-ink-bright">
            {cert.holder_name ?? "Titular"}
          </p>
          <p className="mt-1 text-ink-muted">
            Nivel global:{" "}
            <span className="font-semibold text-ink">
              {cert.global_cefr ?? "—"}
            </span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-line bg-surface2 p-3">
              <div className="text-ink-muted">Emitido</div>
              <div className="font-semibold text-ink">{fmt(cert.issued_at)}</div>
            </div>
            <div className="rounded-md border border-line bg-surface2 p-3">
              <div className="text-ink-muted">Vence</div>
              <div className="font-semibold text-ink">
                {fmt(cert.expires_at)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface p-6 text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <p className="font-display text-lg font-bold text-ink-bright">
            No encontramos este certificado
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            El identificador <code className="text-ink">{id}</code> no
            corresponde a una credencial válida.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-ink-dim">
        Esto es un <strong>EnglishMind Proficiency Statement</strong>, alineado
        al MCER/CEFR: una credencial de progreso verificable.{" "}
        <strong>No</strong> es un examen oficial acreditado (Cambridge, IELTS,
        Aptis, TOEFL). Por ejemplo, B1 ≈ sostiene una conversación de trabajo.
      </p>
    </main>
  );
}
