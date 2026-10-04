/**
 * NIKOLA MD — Quran Verse Lookup
 * Uses the free alquran.cloud API (no key required).
 */

const axios = require('axios');

module.exports = () => ({
  name: "Quran Verse",
  triggers: ["quran", "ayah", "quranverse"],
  react: "🕋",
  description: "Look up a Quran verse. Usage: .quran <surah>:<ayah>",
  category: "Religion",

  run: async ({ m, args, text }) => {
    const ref = (text || '').trim().replace(/\s+/g, '');
    if (!ref) {
      return m.reply(
        `🕋 *NIKOLA MD Quran*\n\n` +
        `*Usage:* .quran <surah>:<ayah>\n` +
        `*Examples:* .quran 1:1, .quran 2:255, .quran 36:80\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }
    if (!/^\d+:\d+$/.test(ref)) {
      return m.reply('⚠️ Format: .quran <surah>:<ayah> (e.g. .quran 1:1)');
    }

    try {
      // Fetch both Arabic (quran-uthmani) and English (saheeh international) editions
      const url = `https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,en.sahih`;
      const res = await axios.get(url, { timeout: 8000 });

      const data = res.data?.data;
      if (!data || !Array.isArray(data) || data.length < 2) {
        return m.reply(`⚠️ Verse *${ref}* not found. Try a different reference.`);
      }

      const arabic = data[0];
      const english = data[1];
      const surahName = arabic.surah?.englishName || '';
      const surahNameAr = arabic.surah?.name || '';
      const surahNum = arabic.surah?.number;
      const ayahNum = arabic.numberInSurah;

      let reply = `🕋 *Surah ${surahName} (${surahNameAr}) — ${surahNum}:${ayahNum}*\n\n`;
      reply += `📜 *Arabic:*\n${arabic.text}\n\n`;
      reply += `📖 *English (Saheeh International):*\n${english.text}\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      if (error.response?.status === 404) {
        m.reply(`⚠️ Verse *${ref}* not found. The Quran has 114 surahs; check the numbers.`);
      } else {
        console.error('NIKOLA MD quran error:', error.message);
        m.reply('⚠️ Could not fetch Quran verse. Try again later.');
      }
    }
  }
});
