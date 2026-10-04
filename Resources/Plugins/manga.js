/**
 * NIKOLA MD — Manga Info
 * Uses AniList GraphQL API (free, no key required).
 */

const axios = require('axios');

const QUERY = `
query ($search: String) {
  Media (search: $search, type: MANGA, sort: POPULARITY_DESC) {
    id
    title { romaji english native }
    status
    format
    volumes
    chapters
    averageScore
    popularity
    favourites
    genres
    startDate { year month day }
    endDate { year month day }
    description(asHtml: false)
    coverImage { large extraLarge }
    siteUrl
    author: staff(perPage: 1) { nodes { name { full } } }
  }
}
`;

module.exports = () => ({
  name: "Manga Info",
  triggers: ["manga", "mng"],
  react: "📖",
  description: "Get manga info. Usage: .manga <title>",
  category: "Entertainment",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `📖 *NIKOLA MD Manga*\n\n` +
        `*Usage:* .manga <title>\n` +
        `*Example:* .manga One Piece\n\n` +
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
        return m.reply(`⚠️ Manga *${text}* not found.`);
      }

      const title = a.title?.english || a.title?.romaji || a.title?.native || text;
      const author = a.author?.nodes?.[0]?.name?.full || 'N/A';
      const genres = (a.genres || []).join(', ') || 'N/A';
      const desc = (a.description || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .slice(0, 500);

      let reply = `📖 *${title}*\n\n`;
      if (a.title?.native) reply += `📛 Native: *${a.title.native}*\n`;
      reply += `✍️ Author: *${author}*\n`;
      reply += `🎬 Format: *${a.format || 'N/A'}*\n`;
      reply += `📚 Volumes: *${a.volumes || 'N/A'}*\n`;
      reply += `📄 Chapters: *${a.chapters || 'N/A'}*\n`;
      reply += `📊 Status: *${a.status || 'N/A'}*\n\n`;
      reply += `⭐ Score: *${a.averageScore ? (a.averageScore / 10).toFixed(1) + '/10' : 'N/A'}*\n`;
      reply += `🔥 Popularity: *${a.popularity?.toLocaleString() || 'N/A'}*\n`;
      reply += `💖 Favourites: *${a.favourites?.toLocaleString() || 'N/A'}*\n\n`;
      reply += `🎭 Genres: *${genres}*\n\n`;
      if (desc) reply += `📝 ${desc}${desc.length >= 500 ? '...' : ''}\n\n`;
      reply += `🔗 ${a.siteUrl || 'https://anilist.co'}\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD manga error:', error.message);
      m.reply('⚠️ Could not fetch manga info. Try again later.');
    }
  }
});
