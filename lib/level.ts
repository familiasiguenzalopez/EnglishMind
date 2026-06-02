import { createClient } from "@/lib/supabase/client";

// Nivel CEFR del usuario: en profiles.cefr_level con sesión; localStorage si no.
const LS = "em_cefr";

export async function loadCefr(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("cefr_level")
        .eq("id", user.id)
        .single();
      return (data?.cefr_level as string | null) ?? null;
    }
  } catch {
    /* fallback */
  }
  try {
    return localStorage.getItem(LS);
  } catch {
    return null;
  }
}

export async function saveCefr(level: string): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ cefr_level: level }).eq("id", user.id);
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    localStorage.setItem(LS, level);
  } catch {
    /* ignore */
  }
}
