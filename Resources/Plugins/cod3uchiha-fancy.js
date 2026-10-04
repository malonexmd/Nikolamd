

const { cod3api } = require('../Functions/cod3uchiha-api.js');


const STYLE_LABELS = [
  ['boldCharMap',      '𝐁𝐨𝐥𝐝'],
  ['italicCharMap',    '𝘐𝘵𝘢𝘭𝘪𝘤'],
  ['boldItalicCharMap','𝙱𝚘𝚕𝚍 𝙸𝚝𝚊𝚕𝚒𝚌'],
  ['monospaceCharMap', '𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎'],
  ['greekCharMap',     'Gяєєк'],
  ['BuzzChar',         'Bυzz'],
  ['DeltaWave',        'Ðelta'],
  ['AncientMap',       'Ancient'],
  ['SinoTibetan',      'Sino'],
  ['BoldFloara',       'Floral'],
];

module.exports = () => ({
  name: 'Fancy Text Styles',
  triggers: ['fancy', 'fancytext', 'stylish', 'textart'],
  description: 'Convert text into decorative font styles',
  category: 'Tools',
  react: '✨',

  run: async ({ m, text, prefix, command }) => {
    if (!text) {
      return m.reply(
        `*Usage:* ${prefix}${command} <text>\n` +
        `*Example:* ${prefix}${command} NIKOLA MD`
      );
    }

    try {
      const data = await cod3api('/tools/fancy', { text }, 15_000);
      const styles = data.result || data;

      let reply = `✨ *Fancy Text Styles*\n\n`;
      for (const [key, label] of STYLE_LABELS) {
        if (styles[key]) {
          reply += `*${label}:*\n${styles[key]}\n\n`;
        }
      }

      if (reply === `✨ *Fancy Text Styles*\n\n`) {
        reply += `No styles returned. Raw output:\n${JSON.stringify(styles, null, 2).slice(0, 800)}`;
      }

      return m.reply(reply.trim());
    } catch (err) {
      return m.reply(`❌ *Fancy Error:* ${err.message || 'Conversion failed. Try again.'}`);
    }
  },
});
