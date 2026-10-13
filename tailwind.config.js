/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ablf: {
          green: '#009B3A',
          yellow: '#FEDD00',
          blue: '#002776',
          dark: '#050a14', // Um azul quase preto, mais profundo
          card: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // Fonte de texto corrido
        display: ['Barlow Condensed', 'sans-serif'], // Fonte de títulos (Energy)
      }
    },
  },
  plugins: [],
}