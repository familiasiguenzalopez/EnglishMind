import Link from "next/link";
import { XpStreak } from "@/components/XpStreak";

// "Entrenador" (estilo Coach de ELSA): hub de herramientas de práctica.
// Es el destino de la pestaña "Practicar".
export const metadata = { title: "Entrenador · EnglishMind" };

type Tool = { href: string; icon: string; label: string; sub: string; tag?: string; g: string };

const TOOLS: Tool[] = [
  { href: "/escenarios", icon: "🎬", label: "Conversación", sub: "Habla en situaciones reales con tu tutor.", tag: "Popular", g: "linear-gradient(135deg,#ff5e9c,#ff8f6b)" },
  { href: "/pronunciacion", icon: "🗣️", label: "Pronunciación", sub: "Afina tu acento, sonido por sonido.", g: "linear-gradient(135deg,#49a8ff,#5ee7d6)" },
  { href: "/escritura", icon: "✍️", label: "Escritura", sub: "Escribe y recibe feedback claro en español.", g: "linear-gradient(135deg,#9b6bff,#7c5cff)" },
  { href: "/repaso", icon: "🔁", label: "Repaso", sub: "Fija lo aprendido con repaso espaciado.", g: "linear-gradient(135deg,#ffc24b,#ff8f6b)" },
  { href: "/aprender", icon: "🛤️", label: "Tu camino", sub: "Plan guiado por niveles CEFR.", g: "linear-gradient(135deg,#2ee6c4,#49a8ff)" },
];

export default function Entrenador() {
  return (
    <main className="mx-auto max-w-2xl px-5 pt-8 pb-28">
      <XpStreak />

      <h1 className="mt-6 font-display text-2xl font-extrabold text-ink-bright">Entrenador</h1>
      <p className="mt-1 text-sm text-ink-muted">Elige cómo quieres practicar hoy.</p>

      <div className="mt-4 space-y-3">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-primary"
          >
            <div className="grid h-12 w-12 flex-none place-items-center rounded-full text-2xl shadow-md" style={{ background: t.g }}>
              {t.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-ink-bright">{t.label}</span>
                {t.tag && (
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-bg">
                    {t.tag}
                  </span>
                )}
              </div>
              <div className="text-xs text-ink-muted">{t.sub}</div>
            </div>
            <span className="flex-none text-ink-dim">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
