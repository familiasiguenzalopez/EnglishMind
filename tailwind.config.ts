import type { Config } from "tailwindcss";

// Tokens definidos en app/globals.css (:root). Aquí se exponen como utilidades.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        line: "var(--border)",
        border2: "var(--border2)",
        // Texto / foreground (evitamos el nombre "text" para no chocar con text-*)
        ink: {
          DEFAULT: "var(--text)",
          bright: "var(--text-bright)",
          muted: "var(--text-muted)",
          dim: "var(--dim)",
        },
        // Marca + semánticos
        primary: { DEFAULT: "var(--color-primary)", dim: "var(--color-primary-dim)" },
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        // Feedback pedagógico
        success: "var(--success)", // pronunciación correcta
        warning: "var(--warning)", // por mejorar (cálido, no alarma)
        danger: "var(--error)",    // solo errores críticos
        // CEFR A1..C2
        cefr: {
          a1: "var(--cefr-a1)",
          a2: "var(--cefr-a2)",
          b1: "var(--cefr-b1)",
          b2: "var(--cefr-b2)",
          c1: "var(--cefr-c1)",
          c2: "var(--cefr-c2)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Bricolage Grotesque", "sans-serif"],
        body: ["var(--font-body)", "Hanken Grotesk", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};

export default config;
