/**
 * NIKOLA MD — Lyrics Command
 * Fetches song lyrics by artist + title.
 * API: lyrics.ovh (free, no key required) with graceful fallback.
 */

const axios = require('axios');

module.exports = () => ({
  name: "Song Lyrics",
  triggers: ["lyrics", "lyric"],
  react: "🎵",
  description: "Get song lyrics. Usage: .lyrics <artist> - <song>",
  category: "Search",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🎵 *NIKOLA MD Lyrics*\n\n` +
        `*Usage:* .lyrics <artist> - <song>\n` +
        `*Example:* .lyrics Queen - Bohemian Rhapsody\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    // Parse "Artist - Song" or "Artist Song"
    let artist = '', title = '';
    if (text.includes(' - ')) {
      [artist, title] = text.split(' - ').map(s => s.trim());
    } else if (text.includes(' by ')) {
      [title, artist] = text.split(' by ').map(s => s.trim());
    } else {
      // Treat first word as artist, rest as title
      const parts = text.split(' ');
      artist = parts[0];
      title = parts.slice(1).join(' ');
    }

    if (!artist || !title) {
      return m.reply('⚠️ Format: .lyrics <artist> - <song>\nExample: .lyrics Queen - Bohemian Rhapsody');
    }

    try {
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
        timeout: 8000
      });

      const lyrics = (res.data?.lyrics || '').trim();
      if (!lyrics) {
        return m.reply(`⚠️ No lyrics found for *${title}* by *${artist}*. Check spelling and try again.`);
      }

      // Truncate very long lyrics to avoid WhatsApp message size limits
      const maxLen = 3500;
      const display = lyrics.length > maxLen
        ? lyrics.slice(0, maxLen) + '\n\n... (truncated)'
        : lyrics;

      const reply =
        `🎵 *${title}*\n` +
        `🎤 *${artist}*\n\n` +
        `${display}\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      if (error.response?.status === 404) {
        m.reply(`⚠️ No lyrics found for *${title}* by *${artist}*. Try a different spelling.`);
      } else {
        console.error('NIKOLA MD lyrics error:', error.message);
        m.reply('⚠️ Could not fetch lyrics. The lyrics service may be down. Try again later.');
      }
    }
  }
});
