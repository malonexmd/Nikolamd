/**
 * NIKOLA MD — Anime Info
 * Uses AniList GraphQL API (free, no key required).
 */

const axios = require('axios');

const QUERY = `
query ($search: String) {
  Media (search: $search, type: ANIME, sort: POPULARITY_DESC) {
    id
    title { romaji english native }
    episodes
    status
    season
    seasonYear
    format
    duration
    averageScore
    popularity
    favourites
    genres
    startDate { year month day }
    endDate { year month day }
    description(asHtml: false)
    coverImage { large extraLarge }
    siteUrl
    studios { nodes { name isAnimationStudio } }
  }
}
`;

module.exports = () => ({
  name: "Anime Info",
  triggers: ["anime", "ani"],
  react: "🌸",
  description: "Get anime info. Usage: .anime <title>",
  category: "Entertainment",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🌸 *NIKOLA MD Anime*\n\n` +
        `*Usage:* .anime <title>\n` +
        `*Example:* .anime Naruto\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      const res = await axios.post('https://graphql.anilist.co', {
        query: QUERY,
        variables: { search: text }
      }, { timeout: 10000 });

      const a = res.data?.data?.Media;
      if (!a) {
        return m.reply(`⚠️ Anime *${text}* not found.`);
      }

      const title = a.title?.english || a.title?.romaji || a.title?.native || text;
      const studios = (a.studios?.nodes || [])
        .filter(s => s.isAnimationStudio)
        .map(s => s.name)
        .join(', ') || 'N/A';
      const genres = (a.genres || []).join(', ') || 'N/A';
      const desc = (a.description || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .slice(0, 500);

      let reply = `🌸 *${title}*\n\n`;
      if (a.title?.native) reply += `📛 Native: *${a.title.native}*\n`;
      reply += `📅 Year: *${a.seasonYear || 'N/A'}* (${a.season ? a.season : ''})\n`;
      reply += `🎬 Format: *${a.format || 'N/A'}*\n`;
      reply += `📺 Episodes: *${a.episodes || 'N/A'}*\n`;
      reply += `⏱ Duration: *${a.duration ? a.duration + ' min/ep' : 'N/A'}*\n`;
      reply += `📊 Status: *${a.status || 'N/A'}*\n\n`;
      reply += `⭐ Score: *${a.averageScore ? (a.averageScore / 10).toFixed(1) + '/10' : 'N/A'}*\n`;
      reply += `🔥 Popularity: *${a.popularity?.toLocaleString() || 'N/A'}*\n`;
      reply += `💖 Favourites: *${a.favourites?.toLocaleString() || 'N/A'}*\n\n`;
      reply += `🎭 Genres: *${genres}*\n`;
      reply += `🏢 Studio: *${studios}*\n\n`;
      if (desc) reply += `📝 ${desc}${desc.length >= 500 ? '...' : ''}\n\n`;
      reply += `🔗 ${a.siteUrl || 'https://anilist.co'}\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD anime error:', error.message);
      m.reply('⚠️ Could not fetch anime info. Try again later.');
    }
  }
});
