/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1f7a54',
          dark: '#145c3e',
          soft: '#e8f5ef'
        },
        ink: '#16231d'
      },
      boxShadow: {
        soft: '0 16px 36px rgba(22, 35, 29, 0.08)'
      }
    }
  },
  plugins: []
}
