module.exports = {
    mode: "jit",
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: false,
    theme: {
        extend: {},
        fontFamily: {
            sans: ['IBM Plex Sans Arabic', 'sans-serif'],
        }
    },
    variants: {
        extend: {},
    },
    plugins: [],
}