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
          DEFAULT: '#0A1F5C',
          light: '#1A3580',
          deep: '#050E2E',
          soft: '#E8F3FF'
        },
        gold: {
          DEFAULT: '#C8960C',
          light: '#F0B429',
          soft: '#FFF3D0'
        },
        tech: '#1677FF',
        ink: '#333D55',
        muted: '#6B7A99',
        line: '#E8ECF2',
        canvas: '#F5F7FA'
      },
      boxShadow: {
        soft: '0 2px 16px rgba(10, 31, 92, 0.10)',
        medium: '0 4px 24px rgba(10, 31, 92, 0.14)'
      }
    }
  },
  plugins: []
}
