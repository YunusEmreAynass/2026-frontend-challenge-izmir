/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                detective: {
                    900: '#0a0a0f',
                    800: '#14141e',
                    700: '#1e1e2d',
                    accent: '#c084fc', // purple accent for mystery
                }
            },
            fontFamily: {
                mono: ['"Fira Code"', 'Consolas', 'monospace'],
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            }
        },
    },
    plugins: [],
}