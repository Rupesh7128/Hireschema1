/**
 * Hireschema App Tailwind config — follows DESIGN.md (repo root).
 *
 * Three colours, one shade each (plus the ink scale for type hierarchy).
 * No brand-*, no gray-*, no chat-*. Everything is ink / paper / accent.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  // Single-mode app — dark mode is NOT enabled for MVP (see DESIGN.md §11).
  darkMode: "media",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // We replace the default colour palette wholesale so accidental
    // usage of `text-blue-500` or `bg-gray-100` fails to compile.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      white: "#FFFFFF",
      black: "#000000",
      // v2 charcoal + lime (DESIGN.md). The `ink` scale is INVERTED for dark:
      // ink-900 = primary light text, ink-100 = dark hairline border.
      ink: {
        50:  "#1B1B1B",  // faint surface / subtle hover on the page
        100: "#2A2A2A",  // hairline borders
        200: "#333333",  // stronger border
        300: "#4D4D4D",  // faint / disabled
        400: "#6B6B6B",  // tertiary text, placeholder
        500: "#A3A3A3",  // muted / secondary text
        600: "#C4C4C4",
        700: "#E0E0E0",
        800: "#F0F0F0",
        900: "#FAFAFA",  // primary text
      },
      paper: {
        DEFAULT: "#141414",  // page canvas
        "0":     "#141414",
        "1":     "#1C1C1C",  // cards / surface (lighter than page)
        "2":     "#17171A",  // landing meme frames
        "3":     "#1E1E22",
      },
      accent: {
        DEFAULT: "#9FE870",  // brand green
        hover:   "#8CCC63",
        deep:    "#7CC94E",
        fg:      "#000000",  // black text on lime — use class text-on-accent
        // Reserved low-emphasis tint for focus rings only.
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
        DEFAULT: "#F76D6D",  // lighter red reads on dark
        bg:      "rgba(247, 109, 109, 0.14)",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        micro:   ["11px", { lineHeight: "1.4",  fontWeight: "500", letterSpacing: "0.04em" }],
        small:   ["13px", { lineHeight: "1.5",  fontWeight: "400" }],
        body:    ["14px", { lineHeight: "1.55", fontWeight: "400" }],
        lead:    ["18px", { lineHeight: "1.6",  fontWeight: "400" }],
        h3:      ["16px", { lineHeight: "1.4",  fontWeight: "600" }],
        h2:      ["20px", { lineHeight: "1.3",  fontWeight: "600", letterSpacing: "-0.005em" }],
        h1:      ["28px", { lineHeight: "1.2",  fontWeight: "600", letterSpacing: "-0.01em" }],
        display: ["40px", { lineHeight: "1.1",  fontWeight: "600", letterSpacing: "-0.01em" }],
        mega:    ["clamp(3.5rem, 14vw, 12rem)", { lineHeight: "0.95", fontWeight: "800", letterSpacing: "-0.055em" }],
      },
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "0",
      },
      boxShadow: {
        // Two shadows. Two.
        "1": "0 1px 2px rgba(0,0,0,0.30), 0 1px 1px rgba(0,0,0,0.20)",
        "2": "0 4px 16px rgba(0,0,0,0.40), 0 2px 4px rgba(0,0,0,0.30)",
        // Focus ring (used by primitives — not a "real" shadow)
        focus: "0 0 0 2px #141414, 0 0 0 4px #9FE870",
        "3": "0 30px 80px -20px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)",
        lift: "0 40px 120px -30px rgba(0,0,0,0.9)",
        ring: "0 0 0 2px #9FE870, 0 0 0 4px #000000",
        "ring-ink": "0 0 0 2px #2E2E34, 0 0 0 4px #000000",
        block: "6px 6px 0 0 #000000",
        "block-accent": "6px 6px 0 0 #9FE870",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "220ms",
        slow: "320ms",
        slower: "700ms",
      },
      animation: {
        "fade-in":      "fadeIn 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up":     "slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left":"slideInLeft 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right":"slideInRight 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in":     "scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "skeleton":     "skeleton 1.4s ease-in-out infinite",
        "typing-dot":   "typingDot 1.4s infinite ease-in-out both",
        "voice-bar":    "voiceBar var(--bar-duration,0.8s) ease-in-out infinite alternate",
        shimmer:        "shimmer 2.4s ease-in-out infinite",
        float:          "float 7s ease-in-out infinite",
        "float-slow":   "float 11s ease-in-out infinite",
        "pulse-glow":   "pulseGlow 3.2s ease-in-out infinite",
        "spin-slow":    "spin 26s linear infinite",
        "shine-wide":   "shineWide 4.5s linear infinite",
        "shine-mid":    "shineMid 4.5s linear infinite",
        "shine-core":   "shineCore 4.5s linear infinite",
        trace:          "trace 7s cubic-bezier(0.55, 0, 0.45, 1) infinite",
        blink:          "blink 1.1s steps(2, start) infinite",
        gradient:       "gradientShift 9s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)",   opacity: "1" },
        },
        slideInLeft: {
          "0%":   { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)",     opacity: "1" },
        },
        slideInRight: {
          "0%":   { transform: "translateX(100%)", opacity: "0.6" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        scaleIn: {
          "0%":   { transform: "scale(0.97)", opacity: "0" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
        shimmer: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        typingDot: {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.4" },
          "40%":           { transform: "scale(1)", opacity: "1" },
        },
        voiceBar: {
          "0%":   { height: "4px"  },
          "100%": { height: "28px" },
        },
        float: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%":     { transform: "translateY(-16px) rotate(1.2deg)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.55", transform: "scale(1)" },
          "50%":     { opacity: "1",    transform: "scale(1.06)" },
        },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        trace: {
          "0%":   { strokeDashoffset: "1850" },
          "100%": { strokeDashoffset: "0" },
        },
        shineWide: {
          "0%":   { clipPath: "polygon(-60% 0, -20% 0, -31% 100%, -71% 100%)" },
          "100%": { clipPath: "polygon(120% 0, 160% 0, 149% 100%, 109% 100%)" },
        },
        shineMid: {
          "0%":   { clipPath: "polygon(-51% 0, -29% 0, -40% 100%, -62% 100%)" },
          "100%": { clipPath: "polygon(129% 0, 151% 0, 140% 100%, 118% 100%)" },
        },
        shineCore: {
          "0%":   { clipPath: "polygon(-44.5% 0, -35.5% 0, -46.5% 100%, -55.5% 100%)" },
          "100%": { clipPath: "polygon(135.5% 0, 144.5% 0, 133.5% 100%, 124.5% 100%)" },
        },
        gradientShift: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%":     { backgroundPosition: "100% 50%" },
        },
      },
      maxWidth: {
        prose: "640px",   // chat, forms, single-column reading
        page: "1024px",   // dashboards, feeds, lists
        wide: "1360px",
      },
    },
  },
  plugins: [],
};

export default config;
