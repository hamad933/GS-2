export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF1F6',
          100: '#D7DCE8',
          300: '#8A97B5',
          500: '#3C4E77',
          600: '#233257',
          700: '#152443',
          900: '#12203D',
        },
        bronze: {
          50: '#F8F1E6',
          100: '#EFE1CC',
          200: '#E0C7A0',
          300: '#D2AD73',
          500: '#AD7C46',
          600: '#8F6236',
          700: '#71501E',
        },
        mineral: {
          50: '#F8F5F0',
          100: '#F1ECE3',
          200: '#E7E0D3',
          300: '#DBD2C0',
          400: '#C4B9A3',
        },
      },
      fontFamily: {
        kufi: ['"Noto Kufi Arabic"', 'sans-serif'],
        plex: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
    },
  },
};
