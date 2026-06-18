/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'asphalt': '#1A1A1A',
        'road-gray': '#2C2C2C',
        'fog-white': '#F5F4F0',
        'slate': '#3D3D3D',
        'amber': '#F59E0B',
        'hazard': '#EA580C',
        'success': '#16A34A',
        'faded-line': '#4B5563',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'sans-serif'],
        'body': ['"Inter"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
