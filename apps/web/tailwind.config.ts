import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      colors: {
        bg: "oklch(10.5% 0.025 245)",
        surface: "oklch(14% 0.022 245)",
        surface2: "oklch(17% 0.022 245)",
        border: "oklch(24% 0.022 245)",
        muted: "oklch(50% 0.045 220)",
        ink: "oklch(88% 0.018 240)",
        heading: "oklch(97% 0.006 240)",
        cyan: "oklch(79% 0.19 200)",
      },
    },
  },
  plugins: [],
} satisfies Config;
