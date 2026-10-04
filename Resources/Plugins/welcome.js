/**
 * NIKOLA MD — Welcome Command
 *
 * Generates a stylized welcome message for a group member.
 * Can be used manually by replying to a user or mentioning them.
 * Use: .welcome @user  OR  .welcome (replying to a message)
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

  run: async ({ m, Cypher, sessionId, args }) => {
    try {
      // Resolve target user: mention, reply, or sender
      let targetJid = '';
      let targetName = '';

      if (m.quoted && m.quoted.sender) {
        targetJid = m.quoted.sender;
        targetName = m.quoted.pushName || targetJid.split('@')[0];
      } else if (args && args.length > 0) {
        // Try to extract a mentioned JID
        const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (mention) {
          targetJid = mention;
          targetName = args.join(' ').replace(/@\d+/g, '').trim() || mention.split('@')[0];
        }
      }

      if (!targetJid) {
        targetJid = m.sender || sessionId;
        targetName = m.pushName || targetJid.split('@')[0];
      }

      // Get group name if available
      let groupName = 'this group';
      try {
        if (m.isGroup) {
          const meta = await Cypher.groupMetadata(m.chat);
          groupName = meta.subject || groupName;
        }
      } catch {}

      // Count members if group
      let memberCount = 'N/A';
      try {
        if (m.isGroup) {
          const meta = await Cypher.groupMetadata(m.chat);
          memberCount = meta.participants?.length || 'N/A';
        }
      } catch {}

      const now = new Date().toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const text =
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
        const ppUrl = await Cypher.profilePictureUrl(targetJid, 'image').catch(() => null);
        if (ppUrl) {
          const { default: axios } = await import('axios');
          const res = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 5000 });
          const imgBuf = Buffer.from(res.data, 'binary');
          await Cypher.sendMessage(
            m.chat,
            {
              image: imgBuf,
              caption: text,
              mentions: [targetJid]
            },
            { quoted: m }
          );
          return;
        }
      } catch {}

      // Fallback: text-only welcome
      await Cypher.sendMessage(
        m.chat,
        {
          text,
          mentions: [targetJid]
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('NIKOLA MD welcome error:', error);
      await Cypher.sendMessage(
        m.chat,
        { text: '⚠️ Could not generate welcome message.' },
        { quoted: m }
      );
    }
  }
});
