/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E2A22",       // primary text — deep green-black
        paper: "#F4F7F3",     // background — soft green-tinted white
        card: "#FFFFFF",      // raised surfaces
        line: "#E1E5DE",      // hairline borders
        gold: {
          DEFAULT: "#2F6B3E", // primary brand green
          dark: "#1F4D2C",
          light: "#E1EFE3",
        },
        field: {
          DEFAULT: "#6B7F3F", // olive — farmer role accent
          dark: "#4F5F2A",
          light: "#EEF1DF",
        },
        slate: {
          DEFAULT: "#3D5A73", // buyer role accent
          dark: "#2B4256",
          light: "#DCE6ED",
        },
        rust: {
          DEFAULT: "#A8432F", // errors / destructive
          light: "#F3DDD6",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};