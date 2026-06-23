/** @type {import('tailwindcss').Config} */
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
      colors: {
        // Light mode colors (existing)
        'page-bg': '#F1D1DC',
        'primary': '#9ED4E0',
        'primary-dark': '#7fd4e0', // A slightly darker shade for hover state
        'accent': '#D27096',
        
        // Dark mode colors
        'dark-bg': '#1a1a1a',
        'dark-surface': '#2d2d2d',
        'dark-surface-hover': '#3a3a3a',
        'dark-border': '#404040',
        'dark-primary': '#4a9ead',
        'dark-primary-hover': '#5bb0c0',
        'dark-accent': '#b85c7f',
        'dark-text': '#e5e5e5',
        'dark-text-secondary': '#a0a0a0',
        'dark-text-muted': '#707070',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
  plugins: [],
}
