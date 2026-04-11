/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066ff',
        'primary-light': '#0066ff',
        success: '#16a34a',
        warning: '#ea580c',
        error: '#dc2626',
      },
      borderColor: {
        DEFAULT: '#e5e7eb',
      },
    },
  },
  plugins: [],
}
