/**
 * NIKOLA MD — Inspirational Quote Command
 * Fetches a random inspirational quote from a public API.
 */

const axios = require('axios');

// Fallback quotes if the API is unreachable
const FALLBACK_QUOTES = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { quote: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" }
];

module.exports = () => ({
  name: "Random Quote",
  triggers: ["quote", "motivate", "inspire"],
  react: "💬",
  description: "Get a random inspirational quote.",
  category: "Fun",

  run: async ({ m, Cypher }) => {
    try {
      let quote;
      try {
        const res = await axios.get('https://api.api-ninjas.com/v1/quotes', {
          timeout: 5000,
          params: { category: 'inspirational' }
        });
        if (res.data && res.data.length > 0) {
          quote = res.data[0];
        }
      } catch {}

      if (!quote) {
        // Fallback to local quotes
        quote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      }

      const text =
        `💬 *"${quote.quote}"*\n\n` +
        `   — *${quote.author}*\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      m.reply(text);
    } catch (error) {
      console.error('NIKOLA MD quote error:', error);
      m.reply('⚠️ Could not fetch a quote right now.');
    }
  }
});
