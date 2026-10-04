/**
 * NIKOLA MD — Tagall Command
 * Mentions every member of a group with an optional custom message.
 * Admin-only — uses the project's getGroupRoles helper for reliable admin checks.
 */

const { getGroupRoles } = require('../Functions/group-antis.js');

module.exports = () => ({
  name: "Tag All Command",
  triggers: ["tagall", "everyone", "hidetag"],
  react: "📣",
  description: "Mention every member of the group (admin only).",
  category: "Group Admin",
  owner: true,

  run: async ({ m, Cypher, args }) => {
    if (!m.isGroup) {
      return m.reply("⚠️ *This command can only be used in groups!*");
    }

    try {
      const { isSenderAdmin, isBotAdmin } = await getGroupRoles(Cypher, m);

      if (!isSenderAdmin) {
        return m.reply("⚠️ *Only group admins can use this command.*");
      }

      if (!isBotAdmin) {
        return m.reply("⚠️ *Bot needs to be an admin to tag all members.*");
      }

      // Fetch group metadata
      const meta = await Cypher.groupMetadata(m.chat);

      // Build mentions list (everyone except the bot itself)
      const botId = (Cypher.user?.id || '').split(':')[0];
      const mentions = meta.participants
        .map(p => p.id)
        .filter(id => !id.startsWith(botId));

      const customMsg = args && args.length > 0 ? args.join(' ') : 'Attention everyone';
      const senderId = (m.sender || '').split(':')[0];

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
      m.reply('❌ *Failed to tag members.* ' + (error.message || ''));
    }
  }
});
