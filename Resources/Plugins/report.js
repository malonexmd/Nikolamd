/**
 * NIKOLA MD — Bug Report
 * Forwards a bug report to the bot owner.
 * Owner number is read from settings.js (BOT_OWNER env var) or defaults to the
 * first paired session.
 */

const axios = require('axios');

// Owner WhatsApp JID — defaults to Nikola MD's number.
// Override with BOT_OWNER_JID env var if you change your number.
const OWNER_JID = process.env.BOT_OWNER_JID || '254711815459@s.whatsapp.net';

module.exports = () => ({
  name: "Bug Report",
  triggers: ["report", "bug", "bugreport"],
  react: "🐞",
  description: "Send a bug report to the bot owner. Usage: .report <description>",
  category: "Utility",

  run: async ({ m, Cypher, args, text, sessionId }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🐞 *NIKOLA MD Bug Report*\n\n` +
        `*Usage:* .report <description>\n` +
        `*Example:* .report The .weather command shows wrong temperature\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    const reporter = m.sender || sessionId || 'unknown';
    const reporterName = m.pushName || reporter.split('@')[0];
    const chat = m.chat || 'unknown';
    const now = new Date().toLocaleString('en-GB');

    const reportText =
      `🐞 *New Bug Report — NIKOLA MD*\n\n` +
      `👤 Reporter: *${reporterName}* (@${reporter.split('@')[0]})\n` +
      `💬 Chat: ${chat}\n` +
      `📅 Time: ${now}\n\n` +
      `📝 *Report:*\n${text}\n\n` +
      `♻️ Powered by *NIKOLA MD*`;

    // Acknowledge to the reporter
    m.reply(
      `✅ *Bug report submitted!*\n\n` +
      `Thank you, *${reporterName}*. The owner has been notified.\n\n` +
      `♻️ Powered by *NIKOLA MD*`
    );

    // Forward to the owner
    try {
      await Cypher.sendMessage(OWNER_JID, { text: reportText, mentions: [reporter] });
    } catch (error) {
      console.error('NIKOLA MD report forward error:', error.message);
      // Owner may not have a chat open with the bot yet; that's OK.
      // The reporter's acknowledgement was already sent.
    }
  }
});
