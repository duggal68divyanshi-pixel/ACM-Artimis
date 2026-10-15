/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#075E54',
        secondary: '#128C7E',
        accent: '#25D366',
        'on-surface': '#111B21',
        'text-secondary': '#54656F',
        'surface-canvas': '#F0F2F5',
        'surface-card': '#FFFFFF',
        'border-subtle': '#E2E5E9',
        'border-strong': '#8696A0',
        'trust-amber': '#FFA000',
        success: '#00A884',
        danger: '#EA0038',
      },
      borderRadius: {
        card: '16px',
        button: '14px',
        pill: '9999px',
      },
      boxShadow: {
        'tier-1': '0 1px 3px rgba(17, 27, 33, 0.08)',
        'tier-2': '0 4px 12px rgba(7, 94, 84, 0.12), 0 1px 2px rgba(17, 27, 33, 0.04)',
        'tier-3': '0 -4px 20px rgba(17, 27, 33, 0.16)',
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Noto Sans Devanagari'", 'sans-serif'],
      },
      fontSize: {
        'headline-lg': ['28px', { lineHeight: '34px', fontWeight: '800' }],
        'headline-md': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '700' }],
        'title-lg': ['16px', { lineHeight: '22px', fontWeight: '700' }],
        'title-md': ['15px', { lineHeight: '20px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '22px', fontWeight: '500' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-lg': ['14px', { lineHeight: '18px', fontWeight: '700' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
