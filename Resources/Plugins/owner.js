/**
 * NIKOLA MD — Owner Info Command
 * Shows the bot owner's contact info.
 *
 * Owner details can be overridden via env vars:
 *   OWNER_NAME       (default: "Nikola MD")
 *   OWNER_WHATSAPP   (default: "254711815459")
 *   OWNER_GITHUB     (default: "https://github.com/malonexmd/Nikolamd")
 *   OWNER_SUPPORT    (default: "N/A")
 */

const OWNER_NAME     = process.env.OWNER_NAME     || 'Nikola MD';
const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || '254711815459';
const OWNER_GITHUB   = process.env.OWNER_GITHUB   || 'https://github.com/malonexmd/Nikolamd';
const OWNER_SUPPORT  = process.env.OWNER_SUPPORT  || 'N/A';

module.exports = () => ({
  name: "Owner Info",
  triggers: ["owner", "creator", "developer"],
  react: "👑",
  description: "Shows the bot owner's contact information.",
  category: "Utility",

  run: async ({ m }) => {
    try {
      const text =
        `👑 *Bot Owner Info*\n\n` +
        `📛 Name: *${OWNER_NAME}*\n` +
        `🐙 GitHub: *${OWNER_GITHUB}*\n` +
        `💬 WhatsApp: *wa.me/${OWNER_WHATSAPP}*\n` +
        `📧 Support: *${OWNER_SUPPORT}*\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      m.reply(text);
    } catch (error) {
      console.error('NIKOLA MD owner error:', error);
      m.reply('⚠️ Could not fetch owner info.');
    }
  }
});
