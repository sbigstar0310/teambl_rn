/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                default: "var(--default)",
                contrast: "var(--contrast)",
                primary: "var(--primary)",
                "primary-bg": "var(--primary-bg)",
                secondary: "var(--secondary)",
                "secondary-bg": "var(--secondary-bg)",
            }
        },
    },
    plugins: [],
}

