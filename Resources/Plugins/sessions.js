const { activeSessions } = require('../Events/connection.js');

module.exports = () => ({
  name: "Sessions Command",
  triggers: ["session", "sessions"],
  description: "Shows all active sessions",
  react: "🟢",
  category: "General",
  restricted: true,

  run: async ({ m, Cypher }) => {
    const sessionIds = Array.from(activeSessions.keys());

    if (!sessionIds.length) {
      return await Cypher.sendMessage(m.chat, {
        text: "❌ No active sessions found."
      }, { quoted: m });
    }

    let text = `*📱 Active Sessions (${sessionIds.length})*\n\n`;
    const mentions = [];

    for (let id of sessionIds) {
      const jid = `${id}@s.whatsapp.net`;
      mentions.push(jid);
      text += `• @${id}\n`;
    }

    await Cypher.sendMessage(m.chat, {
      text,
      mentions
    }, { quoted: m });
  }
});