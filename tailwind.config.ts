import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a2838",
          light: "#243447",
          dark: "#111e2d",
          deeper: "#0d1822",
        },
        gold: {
          DEFAULT: "#E8A838",
          light: "#f0c060",
          dark: "#c48820",
          muted: "#a07020",
        },
        cream: {
          DEFAULT: "#f0e4c8",
          muted: "#c8b898",
          dark: "#9a8868",
        },
        wind: "#7EC8E3",
        wood: "#D4A574",
        compass: "#2D936C",
        danger: "#E84838",
        fog: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        pixel: ["var(--font-pixel)", "monospace"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
      backgroundImage: {
        "navy-radial": "radial-gradient(ellipse at 50% 30%, #243447 0%, #1a2838 45%, #111e2d 100%)",
        "gold-glow": "radial-gradient(circle at center, rgba(232,168,56,0.3) 0%, transparent 70%)",
        "island-glow": "radial-gradient(circle at center, rgba(232,168,56,0.15) 0%, transparent 60%)",
      },
      boxShadow: {
        panel: "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        gold: "0 0 20px rgba(232,168,56,0.4)",
        "gold-sm": "0 0 8px rgba(232,168,56,0.3)",
        island: "0 0 30px rgba(232,168,56,0.2), 0 4px 16px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        panel: "12px",
      },
      animation: {
        "float":       "float 6s ease-in-out infinite",
        "rock":        "rock 5s ease-in-out infinite",
        "pulse-gold":  "pulseGold 2s ease-in-out infinite",
        "pulse-slow":  "pulseSlow 3s ease-in-out infinite",
        "wave":        "wave 3s ease-in-out infinite",
        "shimmer":     "shimmer 2s linear infinite",
        "fill-bar":    "fillBar 1s ease-out forwards",
        "hour-flash":  "hourFlash 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        rock: {
          "0%, 100%": { transform: "translate(-50%, -130%) rotate(-4deg)" },
          "25%":       { transform: "translate(-50%, -136%) rotate(0deg)"  },
          "50%":       { transform: "translate(-50%, -130%) rotate(4deg)"  },
          "75%":       { transform: "translate(-50%, -124%) rotate(0deg)"  },
        },
        pulseGold: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.6" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1",   transform: "scale(1)"    },
          "50%":       { opacity: "0.7", transform: "scale(0.96)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleX(1)" },
          "50%":       { transform: "scaleX(1.05)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fillBar: {
          "0%":   { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        hourFlash: {
          "0%":   { color: "#ffffff", textShadow: "0 0 24px rgba(232,168,56,0.9), 0 0 48px rgba(232,168,56,0.5)" },
          "100%": { color: "#E8A838", textShadow: "none" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
