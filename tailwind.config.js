/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Violet-tinted near-black — warmer and more characterful than pure #000.
        ink: "#14121A",
        canvas: "#F7F7F8",
        surface: "#FFFFFF",
        muted: "#6B7280",
        line: "#E7E7EA",
        // The "vibe" brand accents, echoing the product's own neon/vapor styles.
        vibe: "#7C3AED", // violet
        pulse: "#DB2777", // magenta
        aqua: "#06B6D4", // cyan (used sparingly)
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,18,26,0.04), 0 8px 24px rgba(20,18,26,0.06)",
        lift: "0 12px 40px rgba(124,58,237,0.18)",
      },
      backgroundImage: {
        "vibe-gradient": "linear-gradient(120deg, #7C3AED 0%, #DB2777 55%, #06B6D4 120%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
