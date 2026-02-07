/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          yellow: '#DAE63D',
          'yellow-dark': '#BBC600',
          blue: '#1C5372',
          'blue-light': '#90DBF5',
          peach: '#FFD2C7',
          'dark-blue': '#0A222F',
        },
        purple: {
          dark: '#161A4D',
          mid: '#470059',
          light: '#651E79',
        },
        accent: {
          yellow: '#DAE63D',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.15)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        text: {
          light: '#F2F5FF',
          muted: 'rgba(255, 255, 255, 0.6)',
          'muted-dark': 'rgba(255, 255, 255, 0.9)',
        },
      },
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'],
      },
      fontSize: {
        'hero-desktop': '14rem',
        'hero-tablet': '10rem',
        'hero-mobile': '6rem',
        'title': '48px',
        'body-lg': '24px',
        'body-md': '17px',
        'body': '1.1rem',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '30px',
        '4xl': '45px',
        '5xl': '50px',
        '6xl': '66px',
        '7xl': '70px',
        '8xl': '78px',
        'full': '999px',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
        'card': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        'card-hover': '0 10px 20px rgba(0,0,0,0.2)',
        'inner-purple': '0 0 5px #651E79 inset',
        'premium': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23), 0 0 5px #651E79 inset',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(180deg, #161A4D 0%, #470059 69.71%, #651E79 100%)',
        'gradient-chat': 'linear-gradient(135deg, #1C5372, #90DBF5, #FFD2C7)',
        'gradient-navbar': 'linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.15) 100%)',
        'gradient-header': 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
        'gradient-radial': 'radial-gradient(circle at 50% 0%, rgba(28, 83, 114, 0.3), transparent 70%)',
      },
      keyframes: {
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: 'white' }
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '25%': { opacity: '0.8', transform: 'scale(0.95)' },
          '50%': { opacity: '0.6', transform: 'scale(0.9)' },
          '75%': { opacity: '0.8', transform: 'scale(0.95)' }
        },
        typingBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
      },
      animation: {
        'typing': 'typing 2s steps(30) 1s forwards',
        'blink': 'blink 0.75s step-end infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'bounce': 'bounce 0.6s ease-in-out',
        'pulse-custom': 'pulse 2s ease-in-out infinite',
        'typing-bounce': 'typingBounce 1s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-effect': {
          'background': 'linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.15) 100%)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-lg': {
          'text-shadow': '4px 4px 8px rgba(0, 0, 0, 0.6)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
