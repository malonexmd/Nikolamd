/**
 * NIKOLA MD — Owner Info Command
 * Shows the bot owner's contact info.
 */

module.exports = () => ({
  name: "Owner Info",
  triggers: ["owner", "creator", "developer"],
  react: "👑",
  description: "Shows the bot owner's contact information.",
  category: "Utility",

  run: async ({ m, Cypher }) => {
    try {
      const text =
        `👑 *Bot Owner Info*\n\n` +
        `📛 Name: *Nikola MD*\n` +
        `🐙 GitHub: *github.com/malonexmd/Nikolamd*\n` +
        `💬 WhatsApp: *wa.me/254700000000*\n` +
        `📧 Support: *N/A*\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      m.reply(text);
    } catch (error) {
      console.error('NIKOLA MD owner error:', error);
      m.reply('⚠️ Could not fetch owner info.');
    }
  }
});
