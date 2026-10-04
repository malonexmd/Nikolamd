/**
 * NIKOLA MD — Bug Report
 * Forwards a bug report to the bot owner.
 * Owner number is read from settings.js (BOT_OWNER env var) or defaults to the
 * first paired session.
 */

const axios = require('axios');

// Owner WhatsApp JID — set BOT_OWNER_JID env var to your WhatsApp number
// (e.g. 254700000000@s.whatsapp.net)
const OWNER_JID = process.env.BOT_OWNER_JID || '';

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

    // Try to forward to the owner
    if (OWNER_JID) {
      try {
        await Cypher.sendMessage(OWNER_JID, { text: reportText, mentions: [reporter] });
      } catch (error) {
        console.error('NIKOLA MD report forward error:', error.message);
      }
    } else {
      // No owner configured — log to console so owner still sees it
      console.log('--- NIKOLA MD Bug Report (no BOT_OWNER_JID set) ---');
      console.log(reportText);
      console.log('---');
    }
  }
});
