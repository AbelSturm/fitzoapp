/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        purple: {
          900: '#1E1433',
          800: '#2A1B47',
          600: '#6B46C1',
        },
        teal: {
          400: '#2DD4BF',
        },
        orange: {
          500: '#F85A3E',
          600: '#E54E34',
        },
      },
    },
  },
  plugins: [],
}