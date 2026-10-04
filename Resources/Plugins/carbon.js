/**
 * NIKOLA MD — Code to Image (Carbon)
 * Uses the free carbonara.soopy.dev API (no key required).
 * Generates a styled image of the supplied code.
 */

const axios = require('axios');

module.exports = () => ({
  name: "Code to Image",
  triggers: ["carbon", "code2img", "codeimg"],
  react: "🎨",
  description: "Convert code to a styled image. Usage: .carbon <code>",
  category: "Developer",

  run: async ({ m, Cypher, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🎨 *NIKOLA MD Carbon*\n\n` +
        `*Usage:* .carbon <code>\n` +
        `*Example:* .carbon print("Hello World")\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      // Send "generating..." first
      await m.reply('🎨 Generating code image...');

      const res = await axios.post(
        'https://carbonara.soopy.dev/api/cook',
        {
          code: text,
          language: 'auto',
          theme: 'dracula',
          backgroundColor: 'rgba(30, 30, 46, 1)',
          windowTheme: 'none',
          windowControls: false,
          paddingVertical: '20px',
          paddingHorizontal: '20px',
          dropShadow: true,
          dropShadowBlurRadius: '10px',
          dropShadowOffsetY: '5px',
          fontSize: '14px',
          lineHeight: '143%',
          showLineNumbers: false
        },
        { timeout: 20000, responseType: 'arraybuffer' }
      );

      const imgBuf = Buffer.from(res.data, 'binary');

      await Cypher.sendMessage(
        m.chat,
        {
          image: imgBuf,
          caption: `🎨 *Code Image*\n♻️ Powered by *NIKOLA MD*`
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('NIKOLA MD carbon error:', error.message);
      // Fallback: send the code as a text block
      m.reply(
        `⚠️ Could not generate code image. Service may be down.\n\n` +
        `*Your code:*\n\`\`\`\n${text}\n\`\`\`\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }
  }
});
