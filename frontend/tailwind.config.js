/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d9ff',
        'primary-dark': '#00a8cc',
        accent: '#a855f7',
        'accent-light': '#d946ef',
      },
    },
  },
  plugins: [],
}
