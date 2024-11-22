module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#ff4444',
          yellow: '#ffbb33',
          blue: '#3333ff',
          green: '#00C851',
        },
        secondary: {
          red: '#ff6b6b',
          yellow: '#ffd966',
          blue: '#4d4dff',
          green: '#00e676',
        },
        background: {
          primary: '#f5f7fa',
          secondary: '#e4e9f2',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'hard': '0 8px 30px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'bounce-soft': 'bounce 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { 
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
  safelist: [
    'bg-primary-blue',
    'bg-primary-green',
    'bg-primary-red',
    'bg-primary-yellow',
    'text-primary-blue',
    'text-primary-green',
    'text-primary-red',
    'text-primary-yellow',
    'border-primary-blue',
    'border-primary-green',
    'border-primary-red',
    'border-primary-yellow',
    'hover:bg-primary-blue',
    'hover:bg-primary-green',
    'hover:bg-primary-red',
    'hover:bg-primary-yellow',
  ],
};
