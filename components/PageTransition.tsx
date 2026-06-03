"use client";

import { usePathname } from "next/navigation";

// Transición suave al cambiar de pantalla. Solo anima OPACIDAD (no transform),
// para no afectar el posicionamiento de elementos `position: fixed` (barra
// inferior, modales). Re-monta por ruta vía `key`.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="em-fade">
      {children}
    </div>
  );
}
