/**
 * NIKOLA MD — Daily Horoscope
 * Uses free horoscope-app API (no key required).
 */

const axios = require('axios');

const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

const SIGN_EMOJIS = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌',
  virgo: '♍', libra: '♎', scorpio: '♏', sagittarius: '♐',
  capricorn: '♑', aquarius: '♒', pisces: '♓'
};

module.exports = () => ({
  name: "Daily Horoscope",
  triggers: ["horoscope", "horo"],
  react: "🔮",
  description: "Get daily horoscope. Usage: .horoscope <sign>",
  category: "Entertainment",

  run: async ({ m, args, text }) => {
    const sign = (text || '').toLowerCase().trim();
    if (!sign) {
      return m.reply(
        `🔮 *NIKOLA MD Horoscope*\n\n` +
        `*Usage:* .horoscope <sign>\n` +
        `*Signs:* ${SIGNS.join(', ')}\n` +
        `*Example:* .horoscope leo\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }
    if (!SIGNS.includes(sign)) {
      return m.reply(`⚠️ Invalid sign. Choose from: ${SIGNS.join(', ')}`);
    }

    try {
      const res = await axios.post(
        'https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily',
        { sign, day: 'today' },
        { timeout: 8000 }
      );

      const d = res.data?.data || {};
      const horoscopeText = d.horoscope_data || 'No horoscope available today.';
      const date = d.date || new Date().toDateString();
      const emoji = SIGN_EMOJIS[sign] || '🔮';

      let reply = `${emoji} *${sign.charAt(0).toUpperCase() + sign.slice(1)} — Daily Horoscope*\n`;
      reply += `📅 ${date}\n\n`;
      reply += `${horoscopeText}\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD horoscope error:', error.message);
      // Fallback: simple text response
      m.reply(
        `${SIGN_EMOJIS[sign] || '🔮'} *${sign.charAt(0).toUpperCase() + sign.slice(1)}*\n\n` +
        `⚠️ Horoscope service unavailable right now. Try again later.\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }
  }
});
