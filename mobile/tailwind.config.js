module.exports = {
  content: ["./src/**/*.{js,jsx}", "./AppDriver.js", "./AppHirer.js"],
  theme: {
    extend: {
      colors: {
        brandMint: '#1cd188',
        corporateNavy: '#0f172a',
        // Enhanced color palette
        accent: {
          purple: '#a855f7',
          blue: '#3b82f6',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        slate: {
          850: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          950: '#022c22',
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(28, 209, 136, 0.3)',
        'glow-lg': '0 0 40px rgba(28, 209, 136, 0.4)',
        'inner-glow': '0 0 20px rgba(28, 209, 136, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    }
  },
  plugins: [],
}
