import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Marca principal: Esmeralda (#3fbf8f) — cambiar aquí afecta TODO
        marca: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#3fbf8f", // color principal
          600: "#10b981",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        superficie: {
          DEFAULT: "rgb(var(--color-superficie) / <alpha-value>)",
          alta: "rgb(var(--color-superficie-alta) / <alpha-value>)",
          inversa: "rgb(var(--color-superficie-inversa) / <alpha-value>)",
        },
        texto: {
          DEFAULT: "rgb(var(--color-texto) / <alpha-value>)",
          suave: "rgb(var(--color-texto-suave) / <alpha-value>)",
          tenue: "rgb(var(--color-texto-tenue) / <alpha-value>)",
          inverso: "rgb(var(--color-texto-inverso) / <alpha-value>)",
        },
        borde: {
          DEFAULT: "rgb(var(--color-borde) / <alpha-value>)",
          fuerte: "rgb(var(--color-borde-fuerte) / <alpha-value>)",
        },
        peligro: { DEFAULT: "#dc2626", suave: "#fef2f2" },
        exito: { DEFAULT: "#16a34a", suave: "#f0fdf4" },
        aviso: { DEFAULT: "#ea580c", suave: "#fff7ed" },
        info: { DEFAULT: "#0284c7", suave: "#f0f9ff" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        tarjeta: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        elevada: "0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.05)",
        flotante: "0 12px 32px -8px rgb(0 0 0 / 0.12), 0 8px 16px -4px rgb(0 0 0 / 0.08)",
        marca: "0 8px 24px -8px rgb(63 191 143 / 0.35)",
      },
      keyframes: {
        aparecer: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        aparecer: "aparecer 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
