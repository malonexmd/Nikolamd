/**
 * NIKOLA MD — Menu Command
 *
 * Clean rewrite of the original obfuscated menu plugin.
 * Lists all available commands grouped by category.
 *
 * Replaces: obfuscated `UltraX` menu with a readable `NIKOLA MD` menu.
 */

module.exports = () => ({
  name: "Menu Command",
  triggers: ["menu", "help", "commands"],
  react: "♻️",
  description: "Shows all available commands grouped by category.",
  category: "Utility",

  run: async ({ m, Cypher, sessionId, prefix }) => {
    try {
      // Default prefix if not provided by the runtime
      const cmdPrefix = prefix || ".";

      // Load the plugin registry exported by executor.js
      const executor = require("../Functions/executor.js");
      const plugins = executor.plugins || executor.registry || executor.map || executor;

      // Collect a unique set of plugin objects
      const allPlugins =
        plugins && typeof plugins.values === "function"
          ? [...new Set(plugins.values())]
          : [];

      // Group plugins: builtin vs installed (third-party)
      const builtinCommands = {};
      const installedCommands = {};

      for (const plugin of allPlugins) {
        if (!plugin || (!plugin.triggers && !plugin.name)) continue;

        const category = plugin.category || "Misc";
        const triggers = Array.isArray(plugin.triggers)
          ? plugin.triggers
          : [plugin.triggers].filter(Boolean);

        if (triggers.length === 0) continue;

        const entry = {
          triggers: triggers[0],
          aliases: triggers.slice(1),
          description: plugin.description || "No description available"
        };

        if (plugin.installed) {
          if (!installedCommands[category]) installedCommands[category] = [];
          installedCommands[category].push(entry);
        } else {
          if (!builtinCommands[category]) builtinCommands[category] = [];
          builtinCommands[category].push(entry);
        }
      }

      // Build the menu text
      let menuText =
        `╭─❖ *♻️ NIKOLA MD*\n` +
        `│ Session: @${sessionId}\n` +
        `│ Prefix: ${cmdPrefix}\n` +
        `╰──────────────\n\n`;

      // Built-in commands (sorted by category, then by trigger)
      const sortedBuiltin = Object.entries(builtinCommands).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      for (const [category, commands] of sortedBuiltin) {
        menuText += `╭───❖ *${category}*\n`;
        const sortedCommands = commands.sort((a, b) =>
          a.triggers.localeCompare(b.triggers)
        );
        for (const cmd of sortedCommands) {
          const aliases =
            cmd.aliases && cmd.aliases.length > 0
              ? ` (${cmd.aliases.join(", ")})`
              : "";
          menuText += `│ ➤ *${cmdPrefix}${cmd.triggers}* ${aliases}\n`;
          menuText += `│    ↳  _${cmd.description}_\n`;
        }
        menuText += `╰──────────────\n\n`;
      }

      // Installed / third-party plugins (if any)
      const installedCategories = Object.keys(installedCommands);
      if (installedCategories.length > 0) {
        menuText += `╭───❖ *Installed Plugins*\n`;
        for (const [category, commands] of Object.entries(installedCommands)) {
          menuText += `│  ╭─── *${category}*\n`;
          const sortedCommands = commands.sort((a, b) =>
            a.triggers.localeCompare(b.triggers)
          );
          for (const cmd of sortedCommands) {
            const aliases =
              cmd.aliases && cmd.aliases.length > 0
                ? ` (${cmd.aliases.join(", ")})`
                : "";
            menuText += `│  │ ➤ *${cmdPrefix}${cmd.triggers}* ${aliases}\n`;
            menuText += `│  │    ↳  _${cmd.description}_\n`;
          }
          menuText += `│  ╰──────────────\n`;
        }
        menuText += `╰──────────────\n\n`;
      }

      menuText += `*♻️ NIKOLA MD — Multi-Session WhatsApp Bot!*`;

      // Send the menu, mentioning the session user
      await Cypher.sendMessage(
        m.chat,
        {
          text: menuText,
          mentions: [sessionId]
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("NIKOLA MD menu error:", error);
      await Cypher.sendMessage(
        m.chat,
        {
          text: "⚠️ An error occurred while generating the NIKOLA MD menu. Please try again later."
        },
        { quoted: m }
      );
    }
  }
});
