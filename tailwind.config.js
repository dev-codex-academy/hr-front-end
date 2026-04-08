/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {

        brand: {
          blue: "#4E89BD",
          dark: "#3d6e98",
          red: "#E06C75",
        },
      },
    },
  },
  plugins: [],
};
