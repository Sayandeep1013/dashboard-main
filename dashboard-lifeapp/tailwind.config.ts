import type { Config } from "tailwindcss";

export default {
  darkMode: 'class', // Enable dark mode via class strategy
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        purple: 'var(--color-purple)',
        teal: 'var(--color-teal)',
        orange: 'var(--color-orange)',
        blue: 'var(--color-blue)',
      },
    },
  },
  plugins: [],
} satisfies Config;
