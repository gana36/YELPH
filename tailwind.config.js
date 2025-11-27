/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366F1', // Indigo 500
                    dark: '#4F46E5',    // Indigo 600
                },
                secondary: {
                    DEFAULT: '#10B981', // Emerald 500
                },
                accent: {
                    orange: '#F59E0B', // Amber 500
                    purple: '#A855F7', // Purple 500
                },
                error: '#EF4444',     // Red 500
                background: '#F9FAFB', // Gray 50
                surface: '#FFFFFF',    // White
                text: {
                    primary: '#111827', // Gray 900
                    secondary: '#6B7280', // Gray 500
                },
                border: '#E5E7EB',     // Gray 200
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
