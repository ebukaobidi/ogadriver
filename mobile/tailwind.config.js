/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandMint: '#1cd188',
        corporateNavy: '#0f172a',
      }
    },
  },
  plugins: [],
}
