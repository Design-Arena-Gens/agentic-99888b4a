import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "glass-white": "rgba(255,255,255,0.1)",
        "glass-border": "rgba(255,255,255,0.18)"
      },
      backdropBlur: {
        xs: "2px"
      },
      transitionTimingFunction: {
        "soft-spring": "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      boxShadow: {
        glass: "0 10px 45px rgba(15,15,15,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
