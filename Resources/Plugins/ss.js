/**
 * NIKOLA MD — Website Screenshot
 * Uses WordPress mShots (free, no key required).
 */

const axios = require('axios');

module.exports = () => ({
  name: "Website Screenshot",
  triggers: ["ss", "screenshot", "shoot"],
  react: "📸",
  description: "Take a screenshot of a website. Usage: .ss <url>",
  category: "Developer",

  run: async ({ m, Cypher, args, text }) => {
    let url = (text || '').trim();
    if (!url) {
      return m.reply(
        `📸 *NIKOLA MD Screenshot*\n\n` +
        `*Usage:* .ss <url>\n` +
        `*Example:* .ss github.com\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    // Normalize URL: add https:// if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return m.reply('⚠️ Invalid URL. Example: .ss github.com');
    }

    try {
      await m.reply('📸 Taking screenshot...');

      // WordPress mShots endpoint - free, no key, but takes a moment to generate
      const shotUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=800`;

      // Wait for the screenshot to be generated (poll a couple of times)
      let imgBuf = null;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await axios.get(shotUrl, { responseType: 'arraybuffer', timeout: 15000 });
          const buf = Buffer.from(res.data, 'binary');
          // mShots returns a small placeholder GIF while generating; check size as a heuristic
          if (buf.length > 3000) {
            imgBuf = buf;
            break;
          }
          await new Promise(r => setTimeout(r, 2500));
        } catch {
          await new Promise(r => setTimeout(r, 2500));
        }
      }

      if (!imgBuf) {
        return m.reply('⚠️ Screenshot service is busy or unreachable. Try again in a moment.');
      }

      await Cypher.sendMessage(
        m.chat,
        {
          image: imgBuf,
          caption: `📸 *Screenshot of ${url}*\n♻️ Powered by *NIKOLA MD*`
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('NIKOLA MD ss error:', error.message);
      m.reply('⚠️ Could not take screenshot. Try a different URL or try again later.');
    }
  }
});
