const { nextui } = require("@nextui-org/react");

/** @type {import("tailwindcss").Config} */
module.exports = {
    content: [
        "src/app/**/*.{js,ts,jsx,tsx}",
        "src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "src/components/**/*.{js,ts,jsx,tsx}",
        "./theme.config.jsx",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        screens: {
            desktop: { "max": "1920px" },
            "laptop-big": { "max": "1440px" },
            laptop: { "max": "1280px" },
            tablet: { "max": "1025px" },
            phone: { "max": "615px" },
            "laptop-min": { "min": "1280px" },
            "tablet-min": { "min": "1025px" },
            "phone-min": { "min": "615px" }
        },
        extend: {
            colors: {
                "dark": "#100f10",
                "dark-2": "#1b1b1b",
                "dark-3": "#242424",
                primary: "#00D615",
                secondary: "#007d0d",
                danger: "#ff2c2c",
                warning: "#ffa700",
                "secondary-text": "rgb(115,115,115)"
            },
            animation: {
                "wave-normal": "wave 2s linear infinite",
                "gradient-normal": "gradient 5s ease infinite",
                enter: "enter 200ms ease-out",
                "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
                leave: "leave 150ms ease-in forwards"
            },
            keyframes: {
                gradient: {
                    "0%": { "background-position": "0% 50%" },
                    "50%": { "background-position": "100% 50%" },
                    "100%": { "background-position": "0% 50%" }
                },
                wave: {
                    "0%": { transform: "rotate(-10deg)" },
                    "25%": { transform: "rotate(0deg)" },
                    "50%": { transform: "rotate(10deg)" },
                    "75%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(-10deg)" }
                },
                shimmer: {
                    "100%": {
                        transform: "translateX(100%)"
                    }
                },
                enter: {
                    "0%": { transform: "scale(0.9)", opacity: 0 },
                    "100%": { transform: "scale(1)", opacity: 1 }
                },
                leave: {
                    "0%": { transform: "scale(1)", opacity: 1 },
                    "100%": { transform: "scale(0.9)", opacity: 0 }
                },
                "slide-in": {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(0)" }
                }
            },
            boxShadow: {
                "glow-primary-md": "0 0px 6px -1px #00D615, 0 2px 4px -2px #00D615)",
                "glow-primary-lg": "0 0px 15px -3px #00D615, 0 4px 6px -4px #00D615"
            },
            dropShadow: {
                "glow-primary-md": "0 4px 3px rgb(0 214 21 / 0.25)",
                "glow-primary-lg": "0 4px 10px rgb(0 214 21 / 0.25)"
            },
            backgroundSize: {
                "400%": "400% 400%"
            }
        }
    },
    darkMode: "class",
    plugins: [nextui({
        defaultTheme: "dark",
        themes: {
            dark: {
                colors: {
                    focus: "#00D615",
                    divider: "rgb(255 255 255 / 0.05)",
                    background: "#100f1090",
                    foreground: "#effff0",
                    primary: {
                        foreground: "#effff0",
                        DEFAULT: "#00D615"
                    },
                    secondary: {
                        foreground: "#effff0",
                        DEFAULT: "#007d0d"
                    },
                    danger: {
                        foreground: "#EAE0FF",
                        DEFAULT: "#FF4A4A"
                    }
                }
            }
        }
    })]
};