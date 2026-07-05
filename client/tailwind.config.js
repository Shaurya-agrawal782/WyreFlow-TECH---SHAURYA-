/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#4f46e5", // Indigo 600
        "primary-hover": "#4338ca", // Indigo 700
        "background": "#f8fafc", // Slate 50
        "surface": "#ffffff",
        "border": "#e2e8f0" // Slate 200
      }
    },
  },
  plugins: [],
}
