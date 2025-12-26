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
        sans: ['Montserrat', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2836&auto=format&fit=crop')", // Textura de quadra/bola
      }
    },
  },
  plugins: [],
}