/**
 * NIKOLA MD — News Command
 * Fetches latest news headlines from free RSS feeds (BBC Africa).
 * No API key required.
 */

const axios = require('axios');
const xml2js = require('xml2js');

const FEEDS = [
  { name: 'BBC Africa', url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml' },
  { name: 'BBC World',  url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' }
];

module.exports = () => ({
  name: "Latest News",
  triggers: ["news", "headlines", "latest"],
  react: "📰",
  description: "Get the latest news headlines. Usage: .news [source]",
  category: "Search",

  run: async ({ m, args, text }) => {
    const requestedSource = (text || '').toLowerCase().trim();
    let feed = FEEDS[0];
    if (requestedSource) {
      const match = FEEDS.find(f => f.name.toLowerCase().includes(requestedSource));
      if (match) feed = match;
    }

    try {
      const res = await axios.get(feed.url, { timeout: 8000 });
      const parsed = await xml2js.parseStringPromise(res.data);
      const items = (parsed?.rss?.channel?.[0]?.item || []).slice(0, 8);

      if (items.length === 0) {
        return m.reply('⚠️ No news headlines available right now.');
      }

      let reply = `📰 *${feed.name} — Top Headlines*\n\n`;
      for (let i = 0; i < items.length; i++) {
        const title = items[i].title?.[0] || '(no title)';
        const link  = items[i].link?.[0]  || '';
        reply += `${i + 1}. *${title}*\n`;
        if (link) reply += `   ${link}\n`;
      }
      reply += `\n♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD news error:', error.message);
      m.reply('⚠️ Could not fetch news. Try again later.');
    }
  }
});
