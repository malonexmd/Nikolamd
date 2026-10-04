const { ensureChatSettings, getGroupRoles } = require('../Functions/group-antis.js');


module.exports = () => ({
  name: "Open Group",
  triggers: ["open"],
  description: "Open the group (all members can send messages)",
  category: "Group Admin",
  react: "🔓",
  owner: true,

  run: async ({ m, Cypher }) => {
    
    if (!m.isGroup) {
      return m.reply("⚠️ *This command can only be used in groups!*");
    }

    try {
const { isSenderAdmin, isBotAdmin } = await getGroupRoles(Cypher, m);

      if (!isSenderAdmin) {
        return m.reply("⚠️ *This command requires admin privileges!*");
      }

      if (!isBotAdmin) {
        return m.reply("⚠️ *Bot needs to be an admin to perform this action!*");
      }
      
      await Cypher.groupSettingUpdate(m.chat, "not_announcement");
      m.reply("✅ *Group opened by admin. Members can now send messages.*");
    } catch (error) {
      console.error("Error opening group:", error);
      m.reply("❌ *Failed to open the group. Please try again.*");
    }
  }
});