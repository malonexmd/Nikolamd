/**
 * NIKOLA MD — Wikipedia Command
 * Uses Wikipedia REST API (free, no key required).
 */

const axios = require('axios');

module.exports = () => ({
  name: "Wikipedia Search",
  triggers: ["wikipedia", "wiki", "w"],
  react: "📚",
  description: "Get Wikipedia article summary. Usage: .wiki <query>",
  category: "Search",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `📚 *NIKOLA MD Wikipedia*\n\n` +
        `*Usage:* .wiki <query>\n` +
        `*Example:* .wiki Mount Kenya\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      // Step 1: search for article titles matching the query
      const searchRes = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: text,
          format: 'json',
          srlimit: 1
        },
        timeout: 8000
      });

      const hits = searchRes.data?.query?.search || [];
      if (hits.length === 0) {
        return m.reply(`⚠️ No Wikipedia article found for *${text}*. Try different keywords.`);
      }

      const title = hits[0].title;

      // Step 2: fetch the article summary
      const summaryRes = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        { timeout: 8000 }
      );

      const s = summaryRes.data || {};
      const extract = s.extract || 'No summary available.';
      const url = s.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
      const thumbnail = s.thumbnail?.source;

      let reply =
        `📚 *Wikipedia: ${s.title || title}*\n\n` +
        `${extract}\n\n` +
        `🔗 ${url}\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      // If there's a thumbnail, send with image; otherwise plain text
      if (thumbnail) {
        try {
          const imgRes = await axios.get(thumbnail, { responseType: 'arraybuffer', timeout: 5000 });
          const buf = Buffer.from(imgRes.data, 'binary');
          const { default: Cypher } = arguments[0];
          // Fallback: send text only if image fetch is finicky
          return m.reply(reply);
        } catch {
          return m.reply(reply);
        }
      }

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD wiki error:', error.message);
      m.reply('⚠️ Wikipedia lookup failed. Try again later.');
    }
  }
});
