/** @type {import('tailwindcss').Config} */
const themeColors = require('./src/utils/themeColors.js');

module.exports = {
  // This is the CRITICAL part: it tells Tailwind to scan all files 
  // in the 'src' directory that end in .js, .jsx, .ts, or .tsx 
  // for class names.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: themeColors,
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
  plugins: [],
}
