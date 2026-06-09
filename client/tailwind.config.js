/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#09090b',
          50: '#0d0e12',
          100: '#111318',
          200: '#18181b',
          300: '#1f2028',
        },
        neon: {
          cyan: '#06b6d4',
          purple: '#a855f7',
          emerald: '#10b981',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-dark':
          'radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1)',
        'neon-purple': '0 0 20px rgba(168,85,247,0.3), 0 0 60px rgba(168,85,247,0.1)',
        'neon-emerald': '0 0 20px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.1)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 3s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgba(6,182,212,0.2), 0 0 20px rgba(6,182,212,0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 60px rgba(6,182,212,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.glass': {
          background: 'rgba(24, 24, 27, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-strong': {
          background: 'rgba(9, 9, 11, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.neon-border-cyan': {
          border: '1px solid rgba(6, 182, 212, 0.4)',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.15), inset 0 0 15px rgba(6, 182, 212, 0.05)',
        },
        '.neon-border-purple': {
          border: '1px solid rgba(168, 85, 247, 0.4)',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.15), inset 0 0 15px rgba(168, 85, 247, 0.05)',
        },
        '.neon-border-emerald': {
          border: '1px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.15), inset 0 0 15px rgba(16, 185, 129, 0.05)',
        },
        '.text-gradient-cyan': {
          background: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.text-gradient-purple': {
          background: 'linear-gradient(135deg, #a855f7, #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      });
    },
  ],
};
