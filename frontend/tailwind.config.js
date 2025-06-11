/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tezos: {
          blue: '#0F61FF',
          blueDark: '#003EE0',
          blueLight: '#408DFF',
          blueLighter: '#7CB3FF',
          blueLightest: '#BEDFFF',
          purple: '#9F329F',
        },
        stealth: {
          DEFAULT: '#1D2227',
          dark: '#030405',
          light: '#4A4E52',
          lighter: '#787D82',
          lightest: '#9FA4A9',
        },
        slate: {
          DEFAULT: '#616F82',
          dark: '#263042',
          light: '#818C9B',
          lighter: '#9BA6B5',
          lightest: '#B9C2CF',
        },
        steel: {
          DEFAULT: '#838893',
          dark: '#505561',
          light: '#AEB1B9',
          lighter: '#E3E4E5',
          lightest: '#F6F8FA',
        },
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
}

