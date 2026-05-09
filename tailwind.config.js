/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'app-bg': '#0F0F0F',
        'panel': '#1A1A1A',
        'panel-border': '#2A2A2A',
        'gold': '#C9A96E',
        'blue-accent': '#00A8FF',
        'text-primary': '#F0F0F0',
        'text-secondary': '#888888',
        'hover-bg': '#252525',
      },
    },
  },
  plugins: [],
};

