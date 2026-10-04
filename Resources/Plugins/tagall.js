/**
 * NIKOLA MD — Tagall Command
 * Mentions every member of a group with an optional custom message.
 * Admin-only.
 */

module.exports = () => ({
  name: "Tag All Command",
  triggers: ["tagall", "everyone", "hidetag"],
  react: "📣",
  description: "Mention every member of the group (admin only).",
  category: "Group",

  run: async ({ m, Cypher, args }) => {
    try {
      if (!m.isGroup) {
        return await Cypher.sendMessage(
          m.chat,
          { text: '⚠️ This command can only be used in groups.' },
          { quoted: m }
        );
      }

      // Fetch group metadata
      const meta = await Cypher.groupMetadata(m.chat);
      const senderId = (m.sender || '').split(':')[0];

      // Check admin rights
      const sender = meta.participants.find(p =>
        (p.id || '').split(':')[0] === senderId
      );
      if (!sender || !sender.admin) {
        return await Cypher.sendMessage(
          m.chat,
          { text: '⚠️ Only group admins can use this command.' },
          { quoted: m }
        );
      }

      // Build mentions list (everyone except the bot itself)
      const botId = Cypher.user?.id?.split(':')[0] || '';
      const mentions = meta.participants
        .map(p => p.id)
        .filter(id => !id.startsWith(botId));

      const customMsg = args && args.length > 0 ? args.join(' ') : '📣 *Attention everyone*';
      const header =
        `╭─❖ ♻️ *NIKOLA MD — Tag All*\n` +
        `│ 👑 By: *@${senderId}*\n` +
        `│ 👥 Members: *${mentions.length}*\n` +
        `│ 📝 Message: *${customMsg}*\n` +
        `╰──────────────\n\n`;

      // Compose the body: list every member with a tiny marker
      const body = mentions
        .map((id, i) => `${i + 1}. @${id.split('@')[0]}`)
        .join('\n');

      const text = header + body + `\n\n♻️ Powered by *NIKOLA MD*`;

      await Cypher.sendMessage(
        m.chat,
        {
          text,
          mentions
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('NIKOLA MD tagall error:', error);
      await Cypher.sendMessage(
        m.chat,
        { text: '⚠️ Failed to tag members. ' + (error.message || '') },
        { quoted: m }
      );
    }
  }
});
