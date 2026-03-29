/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Manrope', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#b8ddff',
          300: '#88c8ff',
          400: '#4aaaff',
          500: '#005da6',
          600: '#004d88',
          700: '#003e6d',
          800: '#062f52',
          900: '#08233c'
        }
      },
      boxShadow: {
        glass: '0 18px 60px rgba(2, 8, 23, 0.25)',
        tactile: '0 10px 30px rgba(0,93,166,0.25)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
