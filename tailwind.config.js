module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      animation: {
        moveHand: 'moveHand 3s ease-in-out infinite', // Define the duration, timing function, and iteration count
      },
      keyframes: {
        moveHand: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }, // Example movement, adjust as needed
        },
      },
    },
  },
  plugins: [],
}
