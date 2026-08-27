/**
 * Hireschema Marketing — "Premium Masala" design system.
 * Charcoal base + lime accent (brand), warm saffron + electric violet as
 * depth accents. Built for 3D scroll scenes: perspective, glow, glass.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      white: "#FFFFFF",
      black: "#000000",
      ink: {
        50:  "#18181B",
        100: "#232327",
        200: "#2E2E34",
        300: "#4A4A52",
        400: "#6E6E78",
        500: "#A1A1AA",
        600: "#C7C7CE",
        700: "#E4E4E7",
        800: "#F2F2F4",
        900: "#FAFAFA",
      },
      paper: {
        DEFAULT: "#0A0A0B",
        0:       "#0A0A0B",
        1:       "#111113",
        2:       "#17171A",
        3:       "#1E1E22",
      },
      accent: {
        DEFAULT: "#9FE870",
        hover:   "#B4F58A",
        deep:    "#7CC94E",
        fg:      "#07110A",
        ring:    "rgba(159, 232, 112, 0.30)",
      },
      masala: {
        DEFAULT: "#FFB020",
        hover:   "#FFC44D",
        deep:    "#E08900",
      },
      chai: {
        DEFAULT: "#FF6B4A",
        deep:    "#E04A28",
      },
      volt: {
        DEFAULT: "#8B5CF6",
        deep:    "#6D3EE0",
      },
      destructive: {
        DEFAULT: "#F76D6D",
        bg:      "rgba(247, 109, 109, 0.14)",
      },
    },
    extend: {
      fontFamily: {
        sans:    ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        micro:   ["11px",  { lineHeight: "1.4",  fontWeight: "600", letterSpacing: "0.10em" }],
        small:   ["13px",  { lineHeight: "1.55", fontWeight: "400" }],
        body:    ["15px",  { lineHeight: "1.65", fontWeight: "400" }],
        lead:    ["18px",  { lineHeight: "1.6",  fontWeight: "400" }],
        h3:      ["20px",  { lineHeight: "1.35", fontWeight: "600", letterSpacing: "-0.01em" }],
        h2:      ["28px",  { lineHeight: "1.22", fontWeight: "700", letterSpacing: "-0.02em" }],
        h1:      ["clamp(2rem, 5vw, 3.5rem)",   { lineHeight: "1.08", fontWeight: "700", letterSpacing: "-0.03em" }],
        display: ["clamp(2.75rem, 8vw, 6rem)",  { lineHeight: "0.96", fontWeight: "800", letterSpacing: "-0.045em" }],
        mega:    ["clamp(3.5rem, 14vw, 12rem)", { lineHeight: "0.95", fontWeight: "800", letterSpacing: "-0.055em" }],
      },
      borderRadius: {
        none: "0",
        sm: "6px",
        DEFAULT: "10px",
        md: "12px",
        lg: "16px",
        xl: "22px",
        "2xl": "28px",
        "3xl": "36px",
        full: "9999px",
      },
      boxShadow: {
        "1": "0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(0,0,0,0.3)",
        "2": "0 8px 30px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)",
        "3": "0 30px 80px -20px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)",
        lift: "0 40px 120px -30px rgba(0,0,0,0.9)",
        glow: "0 0 0 1px rgba(159,232,112,0.25), 0 0 40px -8px rgba(159,232,112,0.45)",
        "glow-lg": "0 0 0 1px rgba(159,232,112,0.3), 0 0 90px -10px rgba(159,232,112,0.55)",
        "glow-masala": "0 0 0 1px rgba(255,176,32,0.25), 0 0 50px -10px rgba(255,176,32,0.45)",
        focus: "0 0 0 2px #0A0A0B, 0 0 0 4px #9FE870",
      },
      transitionTimingFunction: {
        "out-soft":  "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-back":  "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      transitionDuration: { fast: "150ms", base: "260ms", slow: "420ms", slower: "700ms" },
      perspective: { near: "600px", DEFAULT: "1200px", far: "2400px" },
      backdropBlur: { xs: "2px" },
      animation: {
        "fade-in":     "fadeIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up":    "slideUp 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "float":       "float 7s ease-in-out infinite",
        "float-slow":  "float 11s ease-in-out infinite",
        "pulse-glow":  "pulseGlow 3.2s ease-in-out infinite",
        "spin-slow":   "spin 26s linear infinite",
        "shimmer":     "shimmer 2.6s linear infinite",
        "blink":       "blink 1.1s steps(2, start) infinite",
        "gradient":    "gradientShift 9s ease infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%":   { transform: "translateY(18px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%":     { transform: "translateY(-16px) rotate(1.2deg)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.55", transform: "scale(1)" },
          "50%":     { opacity: "1",    transform: "scale(1.06)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        gradientShift: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%":     { backgroundPosition: "100% 50%" },
        },
      },
      maxWidth: { prose: "660px", page: "1120px", wide: "1360px" },
    },
  },
  plugins: [],
};

export default config;
