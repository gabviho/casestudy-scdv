/** @type {import('tailwindcss').Config} */
module.exports = {

    // tailwind.config.js

  darkMode: "media", // switch based on prefers-color-scheme
  // … rest of your config 

    content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
