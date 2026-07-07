/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#E67E22",
                    dark: "#D35400",
                    light: "#F5A623",
                    tint: "#FEF3E2",
                },
                ink: "#2B2B2B",
                muted: "#6B6B6B",
                faint: "#A0A0A0",
                line: "#E8D8C3",
                canvas: "#F5EFE6",
                surface: "#FFFFFF",
                danger: "#C0392B",
                success: "#0F6E56",
                dark: "#3A2E2A",
            },
            borderRadius: {
                xl: "16px",
                "2xl": "20px",
                "3xl": "28px",
            },
        },
    },
    plugins: [],
};
