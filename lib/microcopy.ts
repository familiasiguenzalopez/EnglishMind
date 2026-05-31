/**
 * Microcopy en español (Sección 09 · tono de voz).
 * Reglas: de tú, cálido, celebra el esfuerzo, el error nunca avergüenza
 * ("Casi" no "Wrong"), UI en español.
 */
export const microcopy = {
  welcome: "Bienvenido. No necesitas saber nada todavía — vamos a tu ritmo.",
  pronunciation: {
    correct: "¡Lo lograste! Sonó claro.",
    improve: "Casi lo tienes. Escucha la diferencia y vamos de nuevo.",
    unintelligible: "No te entendí esta vez. Probemos más despacio, sin prisa.",
  },
  success: "¡Bien hecho! Lo intentaste, y eso ya cuenta.",
  streakBroken: "¡Qué bueno verte de nuevo! Seguimos justo donde lo dejaste.",
  achievement: "Sobreviviste tu primera llamada en inglés. Eso no es poca cosa.",
  offline: "Sin internet ahora, pero tus lecciones descargadas siguen aquí.",
  empty: "Aún no hay nada por aquí. Cuando practiques, tu progreso aparecerá.",
  retry: "Intentar de nuevo",
  rehearsal: "Modo ensayo: practica sin que cuente",
} as const;

export type Microcopy = typeof microcopy;
