module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-audiowide)', 'sans-serif'],
        sans: ['var(--font-montserrat)', 'sans-serif'],
      },
      colors: {
        primary: '#38BDF8',
        'primary-dark': '#0ea5e9',
        background: '#0f172a',
        surface: '#1e293b',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        border: '#334155',
        glass: 'rgba(30,41,59,0.6)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glow: '0 0 16px #38BDF8, 0 0 32px #38BDF8',
      },
      borderRadius: {
        glass: '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
