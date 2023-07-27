/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      borderWidth: {
        "065": "0.65px",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
};
