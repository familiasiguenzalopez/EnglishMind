// Taxonomía de focos de mejora. Categorías ESTABLES (la IA elige de aquí) para
// poder seguir si el alumno repite o supera un mismo patrón en el tiempo.
export const SKILL_CATEGORIES: Record<string, string> = {
  "verb-tense": "Tiempos verbales",
  "subject-verb": "Concordancia sujeto-verbo",
  "verb-form": "Forma del verbo",
  articles: "Artículos (a/an/the)",
  prepositions: "Preposiciones",
  plurals: "Plurales",
  "word-order": "Orden de palabras",
  "word-choice": "Elección de palabra",
  spelling: "Ortografía",
  punctuation: "Puntuación",
  politeness: "Cortesía / registro",
  naturalness: "Naturalidad",
  pronunciation: "Pronunciación",
  fluency: "Fluidez",
  other: "Otro",
};

export const SKILL_KEYS = Object.keys(SKILL_CATEGORIES);

export function skillLabel(c: string): string {
  return SKILL_CATEGORIES[c] ?? c;
}

// Lista de claves para los prompts de las Edge Functions (debe coincidir).
export const SKILL_KEYS_CSV = SKILL_KEYS.join(", ");
