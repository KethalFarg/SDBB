/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          900: '#014c5d', // Deep Teal from the mock
        }
      },
    },
  },
  plugins: [],
}
