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
        'dark-bg': '#1B1A20',
        'dark-surface': '#25242B',
        'dark-surface-hover': '#2D2B34',
        'dark-border': '#35343D',
        'dark-primary': '#7CC6DA',
        'dark-primary-hover': '#96D5E6',
        'dark-accent': '#E17AA0',
        'dark-text': '#F2F2F5',
        'dark-text-secondary': '#C5C5CF',
        'dark-text-muted': '#90909B',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
  plugins: [],
}
