import { createClient } from "@/lib/supabase/client";

// Preferencias del tutor: acento (para la voz), tono y voz automática.
// Con sesión → profiles; invitado → localStorage.
export type TutorPrefs = { accent: string; tone: string; autoplay: boolean };

const LS = "em_tutor_prefs";
const DEFAULTS: TutorPrefs = { accent: "en-US", tone: "Cercano", autoplay: true };

export async function loadTutorPrefs(): Promise<TutorPrefs> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("tutor_accent,tutor_tone,voice_autoplay")
        .eq("id", user.id)
        .single();
      if (data) {
        return {
          accent: (data.tutor_accent as string) || DEFAULTS.accent,
          tone: (data.tutor_tone as string) || DEFAULTS.tone,
          autoplay: data.voice_autoplay ?? true,
        };
      }
    }
  } catch {
    /* fallback */
  }
  try {
    const v = localStorage.getItem(LS);
    if (v) return { ...DEFAULTS, ...(JSON.parse(v) as Partial<TutorPrefs>) };
  } catch {
    /* */
  }
  return { ...DEFAULTS };
}

export async function saveTutorPrefs(p: TutorPrefs): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ tutor_accent: p.accent, tutor_tone: p.tone, voice_autoplay: p.autoplay })
        .eq("id", user.id);
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    localStorage.setItem(LS, JSON.stringify(p));
  } catch {
    /* */
  }
}
