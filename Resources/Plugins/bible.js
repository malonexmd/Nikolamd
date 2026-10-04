/**
 * NIKOLA MD — Bible Verse Lookup
 * Uses bible-api.com (free, no key required).
 */

const axios = require('axios');

module.exports = () => ({
  name: "Bible Verse",
  triggers: ["bible", "verse", "scripture"],
  react: "✝️",
  description: "Look up a Bible verse. Usage: .bible <book> <chapter>:<verse>",
  category: "Religion",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `✝️ *NIKOLA MD Bible*\n\n` +
        `*Usage:* .bible <book> <chapter>:<verse>\n` +
        `*Examples:* .bible John 3:16, .bible Psalm 23:1\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      const res = await axios.get('https://bible-api.com/' + encodeURIComponent(text), {
        timeout: 8000,
        params: { translation: 'kjv' }
      });

      const d = res.data || {};
      if (!d.reference) {
        return m.reply(`⚠️ Verse *${text}* not found. Try a different reference.`);
      }

      const verses = (d.verses || []).map(v => `*${v.verse}* ${v.text.trim()}`).join('\n\n');
      const reply =
        `✝️ *${d.reference}* (${d.translation_name})\n\n` +
        `${verses}\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      if (error.response?.status === 404) {
        m.reply(`⚠️ Verse *${text}* not found. Try format: .bible John 3:16`);
      } else {
        console.error('NIKOLA MD bible error:', error.message);
        m.reply('⚠️ Could not fetch Bible verse. Try again later.');
      }
    }
  }
});
