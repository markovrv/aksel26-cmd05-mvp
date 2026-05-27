/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#0f172a",
					light: "#1e293b",
					hover: "#334155",
				},
				accent: {
					DEFAULT: "#f59e0b",
					light: "#fbbf24",
					hover: "#d97706",
				},
				background: "#fafafa",
				surface: "#ffffff",
				success: "#059669",
				error: "#dc2626",
				warning: "#d97706",
				info: "#0284c7",
			},
			fontFamily: {
				heading: ["Manrope", "Inter", "system-ui", "sans-serif"],
				sans: ["Inter", "system-ui", "sans-serif"],
			},
			borderRadius: {
				"2xl": "20px",
				"3xl": "24px",
			},
			boxShadow: {
				card: "0 4px 16px rgba(0, 0, 0, 0.04)",
				"card-hover":
					"0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04)",
				accent: "0 4px 20px rgba(245, 158, 11, 0.2)",
				"accent-hover": "0 8px 30px rgba(245, 158, 11, 0.35)",
			},
		},
	},
	plugins: [],
};
