import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0B",
          soft: "#141416",
          raised: "#1B1B1F",
          line: "#26262B",
        },
        paper: {
          DEFAULT: "#F5F6F4",
          deep: "#ECEDE8",
          card: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C7F23C",
          soft: "#E4FAA0",
          deep: "#A6CF1F",
        },
        muted: {
          DEFAULT: "#6C6C72",
          dark: "#9A9AA2",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      maxWidth: {
        page: "1200px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "marquee": "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
