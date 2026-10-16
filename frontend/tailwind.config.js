/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        inkDeep: '#0B0F17',
        gold: '#C6A15B',
        goldSoft: '#E4CFA0',
        parchment: '#F7F5F0',
        ash: '#8A8F98',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
    },
  },
  plugins: [],
};
