/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#0f172a',
          muted: '#475569',
          surface: '#ffffff',
          'surface-2': '#f8fafc',
          primary: '#2563eb',
          secondary: '#16a34a',
          accent: '#7c3aed',
          border: '#e2e8f0',
        },
      },
      boxShadow: {
        brand: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        brand: '16px',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
