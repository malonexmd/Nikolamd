

const { cod3api } = require('../Functions/cod3uchiha-api.js');

module.exports = () => ({
  name: 'Pickup Line',
  triggers: ['pickupline', 'flirt', 'rizz'],
  description: 'Get a random pickup line',
  category: 'Fun',
  react: '💘',

  run: async ({ m }) => {
    try {
      const data = await cod3api('/fun/pickupline', {}, 15_000);
      const line = data.result || data.pickupline || 'No line returned.';

      return m.reply(`💘 *Pickup Line*\n\n_${line}_`);
    } catch (err) {
      return m.reply(`❌ *Error:* ${err.message || 'Failed to fetch a pickup line. Try again later.'}`);
    }
  },
});
