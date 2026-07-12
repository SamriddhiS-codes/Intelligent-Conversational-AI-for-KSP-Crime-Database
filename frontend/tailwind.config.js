/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        ink: {
          DEFAULT: "#111827",
          muted: "#6b7280",
          subtle: "#9ca3af",
        },
        bg: {
          primary: "#f8f9fc",
          secondary: "#f3f4f6",
        },
        card: "#ffffff",
        border: "#e5e7eb",
        highlight: "#dbeafe",
      },
      borderRadius: {
        card: "12px",
        xl: "12px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
}
