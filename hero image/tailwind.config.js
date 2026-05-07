export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 80px rgba(15, 23, 42, 0.3)',
      },
      backgroundImage: {
        'hero-vignette': 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.45) 100%)',
      },
    },
  },
  plugins: [],
};
