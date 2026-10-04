/**
 * NIKOLA MD — Google Search Command
 * Uses DuckDuckGo Instant Answer API (free, no key required).
 * Returns instant answer + related topics for a search query.
 */

const axios = require('axios');

module.exports = () => ({
  name: "Google Search",
  triggers: ["google", "gsearch", "search"],
  react: "🔍",
  description: "Search the web. Usage: .google <query>",
  category: "Search",

  run: async ({ m, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🔍 *NIKOLA MD Search*\n\n` +
        `*Usage:* .google <query>\n` +
        `*Example:* .google best WhatsApp bots\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      const res = await axios.get('https://api.duckduckgo.com/', {
        params: {
          q: text,
          format: 'json',
          no_html: 1,
          skip_disambig: 1
        },
        timeout: 8000
      });

      const data = res.data || {};
      const abstractText = (data.AbstractText || '').trim();
      const abstractSource = data.AbstractSource || '';
      const abstractURL = data.AbstractURL || '';
      const heading = data.Heading || text;

      let reply = `🔍 *${heading}*\n\n`;

      if (abstractText) {
        reply += `${abstractText}\n\n`;
        if (abstractSource) reply += `📚 Source: *${abstractSource}*\n`;
        if (abstractURL) reply += `🔗 ${abstractURL}\n`;
      } else {
        reply += `ℹ️ No instant answer found. `;
      }

      // Add up to 5 related topics
      const topics = (data.RelatedTopics || []).slice(0, 5).filter(t => t.Text);
      if (topics.length > 0) {
        reply += `\n📌 *Related:*\n`;
        for (const t of topics) {
          const tText = t.Text.length > 100 ? t.Text.slice(0, 100) + '...' : t.Text;
          reply += `• ${tText}\n`;
          if (t.FirstURL) reply += `  ${t.FirstURL}\n`;
        }
      }

      // Always include a Google search link
      reply += `\n🔎 Full results: https://www.google.com/search?q=${encodeURIComponent(text)}\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD google error:', error.message);
      m.reply('⚠️ Search failed. Try again later.');
    }
  }
});
