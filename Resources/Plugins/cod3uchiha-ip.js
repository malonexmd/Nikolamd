
const { cod3api } = require('../Functions/cod3uchiha-api.js');

module.exports = () => ({
  name: 'IP Geolocation',
  triggers: ['iplookup', 'ipinfo', 'geoip'],
  description: 'Look up geolocation info for any IP address',
  category: 'Tools',
  react: '🌍',

  run: async ({ m, text, prefix, command }) => {
    if (!text) {
      return m.reply(
        `*Usage:* ${prefix}${command} <IP address>\n` +
        `*Example:* ${prefix}${command} 8.8.8.8`
      );
    }

    
    if (!/^[\d.:a-fA-F]+$/.test(text.trim())) {
      return m.reply(`❌ Invalid IP address format. Example: ${prefix}${command} 8.8.8.8`);
    }

    try {
      const data = await cod3api('/tools/ip', { ip: text.trim() }, 15_000);
      const r = data.result || data;

      const lines = [
        `🌍 *IP Geolocation*`,
        ``,
        `🔹 *IP:* ${r.ip || text}`,
        r.hostname  ? `🔹 *Hostname:* ${r.hostname}` : '',
        r.city      ? `🏙️ *City:* ${r.city}`          : '',
        r.region    ? `📍 *Region:* ${r.region}`       : '',
        r.country   ? `🌐 *Country:* ${r.country}`     : '',
        r.org       ? `🏢 *ISP/Org:* ${r.org}`         : '',
        r.postal    ? `📮 *Postal:* ${r.postal}`        : '',
        r.timezone  ? `⏰ *Timezone:* ${r.timezone}`   : '',
        r.loc       ? `📌 *Coordinates:* ${r.loc}`     : '',
      ].filter(Boolean).join('\n');

      return m.reply(lines);
    } catch (err) {
      return m.reply(`❌ *Lookup Error:* ${err.message || 'Could not look up that IP address.'}`);
    }
  },
});
