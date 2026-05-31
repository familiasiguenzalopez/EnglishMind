"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/home", label: "Inicio", icon: "🏠" },
  { href: "/onboarding", label: "Practicar", icon: "🎯" },
  { href: "/pronunciacion", label: "Pronunciar", icon: "🗣️" },
  { href: "/escritura", label: "Escribir", icon: "✍️" },
];

// Pantallas a pantalla completa o fuera del shell: sin barra.
const HIDE_PREFIXES = ["/sesion", "/login", "/verify", "/auth"];

export function BottomNav() {
  const pathname = usePathname() || "/";
  const hidden =
    pathname === "/" || HIDE_PREFIXES.some((p) => pathname.startsWith(p));
  if (hidden) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {TABS.map((t) => {
          const active =
            pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition",
                active ? "text-primary" : "text-ink-muted hover:text-ink",
              )}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
