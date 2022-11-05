export const substanceColors = Array.from(
    { length: 10 }, 
    (_, i) => `hsl(${360 * (i / 10 * 2.1)}, 100%, 50%)`);