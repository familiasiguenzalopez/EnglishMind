import { createBrowserClient } from "@supabase/ssr";

/** Cliente Supabase para el navegador (usa la anon key, segura de exponer). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
