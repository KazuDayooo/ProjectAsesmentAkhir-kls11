/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F7F3E8',
          200: '#EBE2CD',
          300: '#DFCEAA',
          400: '#D1B681',
          500: '#C49F5A',
        }
      }
    },
  },
  plugins: [],
};

export default config;
