/**
 * NIKOLA MD — Islamic Prayer Times
 * Uses the free Aladhan API (no key required).
 *
 * Usage: .prayertimes <city>      — defaults to today
 *        .prayertimes <city>, <country>
 */

const axios = require('axios');

module.exports = () => ({
  name: "Prayer Times",
  triggers: ["prayertimes", "salah", "prayers", "prayertime"],
  react: "🕌",
  description: "Get Islamic prayer times. Usage: .prayertimes <city>",
  category: "Religion",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🕌 *NIKOLA MD Prayer Times*\n\n` +
        `*Usage:* .prayertimes <city> [country]\n` +
        `*Examples:* .prayertimes Nairobi, .prayertimes Cairo Egypt\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    // Try to split "city, country" or "city country"
    let city = text;
    let country = '';
    if (text.includes(',')) {
      [city, country] = text.split(',').map(s => s.trim());
    } else {
      const parts = text.split(' ');
      if (parts.length >= 2) {
        // Heuristic: last word might be country if it's 1 word
        country = parts[parts.length - 1];
        city = parts.slice(0, -1).join(' ');
      }
    }

    try {
      const params = { city, method: 2 }; // method 2 = ISNA
      if (country) params.country = country;

      const res = await axios.get('http://api.aladhan.com/v1/timingsByCity', {
        params,
        timeout: 8000
      });

      const d = res.data?.data;
      if (!d) {
        return m.reply(`⚠️ Could not fetch prayer times for *${city}*. Try a different spelling.`);
      }

      const t = d.timings || {};
      const date = d.date?.readable || '';
      const hijri = d.date?.hijri?.date || '';
      const meta = d.meta || {};
      const tz = meta.timezone || '';

      // Prayer times to display
      const prayers = [
        ['Fajr',    t.Fajr],
        ['Sunrise', t.Sunrise],
        ['Dhuhr',   t.Dhuhr],
        ['Asr',     t.Asr],
        ['Maghrib', t.Maghrib],
        ['Isha',    t.Isha]
      ];

      const cityLabel = city + (country ? ', ' + country : '');

      let reply = `🕌 *Prayer Times — ${cityLabel}*\n\n`;
      reply += `📅 ${date}${hijri ? ` (${hijri} AH)` : ''}\n`;
      if (tz) reply += `🕐 Timezone: ${tz}\n\n`;
      reply += `*Today's Prayers:*\n`;
      for (const [name, time] of prayers) {
        if (time) reply += `🌙 ${name.padEnd(8)} : *${time}*\n`;
      }
      reply += `\n♻️ Powered by *NIKOLA MD* (data: Aladhan)`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD prayertimes error:', error.message);
      m.reply(`⚠️ Could not fetch prayer times for *${city}*. Check the city name and try again.`);
    }
  }
});
