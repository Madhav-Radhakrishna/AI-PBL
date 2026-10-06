/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hazard: {
          critical: "#ef4444",
          high: "#f97316",
          moderate: "#f59e0b",
          safe: "#10b981",
        }
      }
    },
  },
  plugins: [],
}
