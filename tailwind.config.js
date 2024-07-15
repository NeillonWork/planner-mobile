//importação dos meus themas que esta la no meus styles
import { colors } from "./src/styles/colors";
import { fontFamily } from "./src/styles/fontFamily";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        //meu tema de cores e fontes aqui
        colors,
        fontFamily
    },
  },
  plugins: [],
};
