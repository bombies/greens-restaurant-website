/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
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
      },
      colors: {
        'green-50': 'rgb(240 253 244)',
        'green-100': 'rgb(220 252 231)',
        'green-200': 'rgb(187 247 208)',
        'green-300': 'rgb(134 239 172)',
        'green-400': 'rgb(74 222 128)',
        'green-500': 'rgb(34 197 94)',
        'green-600': 'rgb(22 163 74)',
        'green-700': 'rgb(21 128 61)',
        'green-800': 'rgb(22 101 52)',
        'green-900': 'rgb(20 83 45)'
      },
    },
  },
  plugins: [require('flowbite/plugin')],
  darkMode: 'class'
}
