/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C92C2E',
          'red-hover': '#AF2426',
          'red-subtle': 'rgba(201, 44, 46, 0.08)',
          peach: '#FF9D73',
          'peach-light': '#FFB08E',
          dark: '#1F2124',
          'dark-surface': '#272A2E',
          gray: '#979797',
          'gray-light': '#E7E9ED',
          surface: '#F5F5F4',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '26px',
      },
      boxShadow: {
        'editorial': '0 4px 20px rgba(0, 0, 0, 0.03)',
        'editorial-hover': '0 10px 30px rgba(0, 0, 0, 0.07)',
        'dark-float': '0 12px 36px rgba(15, 17, 20, 0.28)',
      }
    },
  },
  plugins: [],
}
