/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    animation: {
      'slide-left': 'slide-left-keyframe .4s forwards',
      'slide-right': 'slide-right-keyframe .4s forwards',
      'spin': 'spin .75s linear infinite',
      'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
    },
    extend: {
      keyframes: {
        'slide-left-keyframe': {
          '0%': { 'margin-left': '120%' },
          '100%': { 'margin-left': '0%' }
        },
        'slide-right-keyframe': {
          '0%': { 'margin-left': '0%' },
          '100%': { 'margin-left': '120%' }
        },
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}
