/** @type {import('tailwindcss').Config} */
module.exports = {
  // This is the CRITICAL part: it tells Tailwind to scan all files 
  // in the 'src' directory that end in .js, .jsx, .ts, or .tsx 
  // for class names.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // User-defined colors
        'page-bg': '#F1D1DC',
        'primary': '#9ED4E0',
        'primary-dark': '#7fd4e0', // A slightly darker shade for hover state
        'accent': '#D27096',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
  plugins: [],
}