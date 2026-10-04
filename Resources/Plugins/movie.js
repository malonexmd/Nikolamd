/**
 * NIKOLA MD — Movie Info
 * Uses OMDb API. To use this command, set OMDB_API_KEY in your environment.
 * Free tier: 1,000 requests/day at https://www.omdbapi.com/apikey.aspx
 *
 * Falls back to a usage hint if no API key configured.
 */

const axios = require('axios');

const API_KEY = process.env.OMDB_API_KEY || '';

module.exports = () => ({
  name: "Movie Info",
  triggers: ["movie", "film", "imdb"],
  react: "🎬",
  description: "Get movie info. Usage: .movie <title>",
  category: "Entertainment",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🎬 *NIKOLA MD Movie*\n\n` +
        `*Usage:* .movie <title>\n` +
        `*Example:* .movie Inception\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    if (!API_KEY) {
      return m.reply(
        `⚠️ *OMDb API key not configured.*\n\n` +
        `Get a free key at: https://www.omdbapi.com/apikey.aspx\n` +
        `Then set the env var: OMDB_API_KEY=your_key\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      const res = await axios.get('http://www.omdbapi.com/', {
        params: { t: text, apikey: API_KEY, plot: 'short' },
        timeout: 8000
      });

      const d = res.data || {};
      if (d.Response === 'False') {
        return m.reply(`⚠️ Movie *${text}* not found. Check the title and try again.`);
      }

      const ratings = (d.Ratings || []).map(r => `${r.Source}: ${r.Value}`).join('\n• ');

      let reply = `🎬 *${d.Title}* (${d.Year})\n\n`;
      reply += `⭐ Rated: *${d.imdbRating || 'N/A'}/10* (${d.imdbVotes || 0} votes)\n`;
      if (ratings) reply += `• ${ratings}\n`;
      reply += `\n`;
      reply += `🎭 Genre: *${d.Genre || 'N/A'}*\n`;
      reply += `📅 Released: *${d.Released || 'N/A'}*\n`;
      reply += `⏱ Runtime: *${d.Runtime || 'N/A'}*\n`;
      reply += `🎬 Director: *${d.Director || 'N/A'}*\n`;
      reply += `🌟 Actors: *${d.Actors || 'N/A'}*\n`;
      reply += `🌐 Language: *${d.Language || 'N/A'}*\n`;
      reply += `🏆 Awards: *${d.Awards || 'None'}*\n\n`;
      if (d.Plot) reply += `📝 Plot: ${d.Plot}\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD movie error:', error.message);
      m.reply('⚠️ Could not fetch movie info. Try again later.');
    }
  }
});
