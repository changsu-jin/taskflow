import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        sans: ["Pretendard", "-apple-system", "sans-serif"],
      },
      colors: {
        surface: "#FFFFFF",
        bg: "#FAFBFC",
        border: "#E1E4E8",
        "text-primary": "#1B2332",
        "text-secondary": "#6B7685",
        "text-muted": "#9CA3AF",
        todo: "#6366F1",
        progress: "#F59E0B",
        done: "#10B981",
        "priority-high": "#EF4444",
        "priority-medium": "#F59E0B",
        "priority-low": "#6B7685",
      },
    },
  },
  plugins: [],
};
export default config;
