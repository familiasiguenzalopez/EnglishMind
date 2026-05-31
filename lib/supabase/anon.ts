import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo para lectura de catálogo público (tutores, rutas, planes).
 * Útil en Server Components pre-login (onboarding, selección de tutor).
 */
export function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
