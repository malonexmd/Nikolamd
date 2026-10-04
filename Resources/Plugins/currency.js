/**
 * NIKOLA MD — Currency Converter
 * Uses open.er-api.com (free, no key required).
 */

const axios = require('axios');

module.exports = () => ({
  name: "Currency Converter",
  triggers: ["currency", "convert", "fx"],
  react: "💱",
  description: "Convert currency. Usage: .currency <amount> <from> <to>",
  category: "Finance",

  run: async ({ m, args, text }) => {
    if (!args || args.length < 3) {
      return m.reply(
        `💱 *NIKOLA MD Currency*\n\n` +
        `*Usage:* .currency <amount> <from> <to>\n` +
        `*Example:* .currency 100 USD KES\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    const amountStr = args[0];
    const fromCur = args[1].toUpperCase();
    const toCur = args[2].toUpperCase();
    const amount = parseFloat(amountStr);

    if (!amount || amount <= 0) {
      return m.reply('⚠️ Amount must be a positive number.');
    }
    if (fromCur.length !== 3 || toCur.length !== 3) {
      return m.reply('⚠️ Currency codes must be 3 letters (e.g. USD, KES, EUR).');
    }

    try {
      const res = await axios.get(`https://open.er-api.com/v6/latest/${fromCur}`, { timeout: 8000 });
      const rates = res.data?.rates || {};
      const rate = rates[toCur];

      if (!rate) {
        return m.reply(`⚠️ Could not find exchange rate from *${fromCur}* to *${toCur}*. Check the codes and try again.`);
      }

      const converted = amount * rate;
      const updated = res.data?.time_last_update_utc || 'recently';

      const reply =
        `💱 *Currency Conversion*\n\n` +
        `💵 ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} *${fromCur}* =\n` +
        `💰 *${converted.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${toCur}*\n\n` +
        `📊 Rate: 1 ${fromCur} = ${rate.toFixed(4)} ${toCur}\n` +
        `🕐 Updated: ${updated}\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD currency error:', error.message);
      m.reply('⚠️ Could not fetch exchange rates. Try again later.');
    }
  }
});
