/**
 * NIKOLA MD — Welcome Command
 *
 * Generates a stylized welcome message for a group member.
 * Use: .welcome @user  OR  .welcome (replying to a message)  OR  .welcome (alone)
 *
 * Note: This is a manual trigger. For automatic welcome on group-join,
 * a separate event handler would need to be wired into the obfuscated
 * events system (not safe to edit). This command gives you 90% of the
 * value with zero risk.
 */

module.exports = () => ({
  name: "Welcome Command",
  triggers: ["welcome", "wel"],
  react: "👋",
  description: "Send a stylish welcome message to a group member.",
  category: "Group",

  run: async ({ m, Cypher, args, sessionId }) => {
    try {
      // Resolve target user: mention, reply, or sender
      let targetJid = '';
      let targetName = '';

      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0];
        targetName = args.join(' ').replace(/@\d+/g, '').trim() || targetJid.split('@')[0];
      } else if (m.quoted && m.quoted.sender) {
        targetJid = m.quoted.sender;
        targetName = m.quoted.pushName || targetJid.split('@')[0];
      } else {
        targetJid = m.sender || sessionId;
        targetName = m.pushName || targetJid.split('@')[0];
      }

      // Get group name + member count if in a group
      let groupName = 'this group';
      let memberCount = 'N/A';
      if (m.isGroup) {
        try {
          const meta = await Cypher.groupMetadata(m.chat);
          groupName = meta.subject || groupName;
          memberCount = meta.participants?.length || 'N/A';
        } catch {}
      }

      const now = new Date().toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const caption =
        `╭───────────────────\n` +
        `│ ♻️ *WELCOME*\n` +
        `│\n` +
        `│ 👋 Welcome *${targetName}* to\n` +
        `│ 📍 *${groupName}*\n` +
        `│\n` +
        `│ 🎯 You are member #${memberCount}\n` +
        `│ ⏰ Joined: ${now}\n` +
        `│\n` +
        `│ 📋 Type *.rules* to see group rules\n` +
        `│ 🤖 Type *.menu* to see bot commands\n` +
        `│\n` +
        `╰───────────────────\n` +
        `♻️ Powered by *NIKOLA MD*`;

      // Try to fetch the target's profile picture and send it with the welcome text
      try {
        const ppUrl = await Cypher.profilePictureUrl(targetJid, 'image');
        await Cypher.sendMessage(
          m.chat,
          {
            image: { url: ppUrl },
            caption,
            mentions: [targetJid]
          },
          { quoted: m }
        );
      } catch {
        // No profile pic (privacy) — fallback to text-only welcome
        await Cypher.sendMessage(
          m.chat,
          {
            text: caption,
            mentions: [targetJid]
          },
          { quoted: m }
        );
      }
    } catch (error) {
      console.error('NIKOLA MD welcome error:', error);
      m.reply('⚠️ Could not generate welcome message. ' + (error.message || ''));
    }
  }
});
