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
          surface: '#0b1324', // fundo de cartões nas páginas internas
          raised: '#111c33',  // cartão em destaque / hover
          line: '#1f2a44',    // bordas e divisores
          live: '#ef4444',    // ao vivo
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