/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0c1929',
        'navy-mid': '#132a45',
        gold: '#c4a35a',
        'gold-dim': '#9a7b3a',
        cream: '#f7f5f0',
        paper: '#fdfcfa',
        muted: '#5c6b7a',
        line: '#e2ddd3',
      },
    },
  },
  plugins: [],
}
