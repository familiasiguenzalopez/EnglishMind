import { anonClient } from "@/lib/supabase/anon";
import { OnboardingFlow } from "@/components/OnboardingFlow";

// Onboarding inmersivo (estilo ELSA): la mascota/personaje guía la creación del
// perfil paso a paso. Carga las rutas reales y delega la experiencia al cliente.
export const dynamic = "force-dynamic";

type Route = { slug: string; name: string; description: string | null };

export default async function Onboarding() {
  const supabase = anonClient();
  const { data } = await supabase
    .from("routes")
    .select("slug,name,description")
    .order("sort_order");
  const routes = (data ?? []) as Route[];

  return <OnboardingFlow routes={routes} />;
}
