/** @type {import('tailwindcss').Config} */
module.exports = {
  // This is the CRITICAL part: it tells Tailwind to scan all files 
  // in the 'src' directory that end in .js, .jsx, .ts, or .tsx 
  // for class names.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
  plugins: [],
}