/**
 * NIKOLA MD — Menu Command (Style 3: Elegant Borders with Bold)
 *
 * Renders a premium-looking menu with double-line borders (═),
 * diamond markers (◆), and bold text throughout.
 *
 * Header includes owner info + stats.
 * Body groups all plugins by category with command + aliases.
 * Footer shows total counts and brand line.
 */

const fs = require('fs');
const path = require('path');

// Owner info (kept in sync with owner.js defaults)
const OWNER_NAME     = process.env.OWNER_NAME     || 'Nikola MD';
const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || '254711815459';
const OWNER_GITHUB   = process.env.OWNER_GITHUB   || 'https://github.com/malonexmd/Nikolamd';
const OWNER_SUPPORT  = process.env.OWNER_SUPPORT  || 'nikolaklaus0@gmail.com';

// Emoji + label for each known category (in display order)
const CATEGORY_META = {
  'AI':            { emoji: '🤖', label: 'AI' },
  'Developer':     { emoji: '💻', label: 'DEVELOPER' },
  'Downloader':    { emoji: '📥', label: 'DOWNLOADER' },
  'Entertainment': { emoji: '🎬', label: 'ENTERTAINMENT' },
  'Finance':       { emoji: '💰', label: 'FINANCE' },
  'Fun':           { emoji: '🎮', label: 'FUN' },
  'Games':         { emoji: '🎯', label: 'GAMES' },
  'General':       { emoji: '🌐', label: 'GENERAL' },
  'Group':         { emoji: '👥', label: 'GROUP' },
  'Group Admin':   { emoji: '🛡️', label: 'GROUP ADMIN' },
  'Media':         { emoji: '🖼️', label: 'MEDIA' },
  'Owner':         { emoji: '👑', label: 'OWNER' },
  'Religion':      { emoji: '🛐', label: 'RELIGION' },
  'Search':        { emoji: '🔍', label: 'SEARCH' },
  'Settings':      { emoji: '⚙️', label: 'SETTINGS' },
  'Tools':         { emoji: '🛠️', label: 'TOOLS' },
  'Utility':       { emoji: '🔧', label: 'UTILITY' },
  'Misc':          { emoji: '📦', label: 'MISC' }
};

// Fallback for unknown categories
function metaFor(cat) {
  return CATEGORY_META[cat] || { emoji: '📦', label: (cat || 'MISC').toUpperCase() };
}

module.exports = () => ({
  name: "Menu Command",
  triggers: ["menu", "help", "commands"],
  react: "♻️",
  description: "Shows all available commands grouped by category.",
  category: "Utility",

  run: async ({ m, Cypher, sessionId, prefix }) => {
    try {
      const cmdPrefix = prefix || '.';

      // Load the plugin registry exported by executor.js
      const executor = require('../Functions/executor.js');
      const plugins = executor.plugins || executor.registry || executor.map || executor;

      // Collect a unique set of plugin objects
      const allPlugins =
        plugins && typeof plugins.values === 'function'
          ? [...new Set(plugins.values())]
          : [];

      // Group plugins: builtin vs installed (third-party)
      const builtinCommands = {};
      const installedCommands = {};

      for (const plugin of allPlugins) {
        if (!plugin || (!plugin.triggers && !plugin.name)) continue;

        const category = plugin.category || 'Misc';
        const triggers = Array.isArray(plugin.triggers)
          ? plugin.triggers
          : [plugin.triggers];

        if (triggers.length === 0 || !triggers[0]) continue;

        const entry = {
          triggers: triggers[0],
          aliases: triggers.slice(1),
          description: plugin.description || 'No description available'
        };

        if (plugin.installed) {
          if (!installedCommands[category]) installedCommands[category] = [];
          installedCommands[category].push(entry);
        } else {
          if (!builtinCommands[category]) builtinCommands[category] = [];
          builtinCommands[category].push(entry);
        }
      }

      // Build the menu text — Style 3: Elegant Borders with Bold
      let menuText = '';

      // === HEADER CARD ===
      menuText += '╔══════════════════════════════════════╗\n';
      menuText += '║         ♻️  *N I K O L A   M D*  ♻️        ║\n';
      menuText += '║      Multi-Session WhatsApp Bot      ║\n';
      menuText += '╚══════════════════════════════════════╝\n\n';

      // === OWNER INFO CARD ===
      menuText += '┌─ 👑 *OWNER INFO* ──────────────────┐\n';
      menuText += `│ *Name*     : ${OWNER_NAME}\n`;
      menuText += `│ *GitHub*   : ${OWNER_GITHUB}\n`;
      menuText += `│ *WhatsApp* : wa.me/${OWNER_WHATSAPP}\n`;
      menuText += `│ *Email*    : ${OWNER_SUPPORT}\n`;
      menuText += '└──────────────────────────────────────┘\n\n';

      // === STATS CARD ===
      const totalCmds = Object.values(builtinCommands).reduce((sum, cmds) => sum + cmds.length, 0)
                      + Object.values(installedCommands).reduce((sum, cmds) => sum + cmds.length, 0);
      const totalCategories = Object.keys(builtinCommands).length + Object.keys(installedCommands).length;
      const now = new Date().toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      menuText += '┌─ 📊 *STATS* ──────────────────────┐\n';
      menuText += `│ *Total cmds*  : ${totalCmds}\n`;
      menuText += `│ *Categories*  : ${totalCategories}\n`;
      menuText += `│ *Prefix*      : ${cmdPrefix}\n`;
      menuText += `│ *Date*        : ${now}\n`;
      menuText += `│ *Session*     : @${sessionId}\n`;
      menuText += '└──────────────────────────────────────┘\n\n';

      // === DIVIDER ===
      menuText += '═══════════════════════════════════════\n\n';

      // === COMMANDS BY CATEGORY ===
      // Sort categories: known ones in CATEGORY_META order, then any unknown
      const knownOrder = Object.keys(CATEGORY_META);
      const allCategories = Object.keys(builtinCommands).sort((a, b) => {
        const ia = knownOrder.indexOf(a);
        const ib = knownOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });

      for (const category of allCategories) {
        const commands = builtinCommands[category] || [];
        if (commands.length === 0) continue;

        const meta = metaFor(category);
        const sortedCommands = commands.sort((a, b) =>
          a.triggers.localeCompare(b.triggers)
        );

        // Category header card
        menuText += '╔═══════════════════════════════════════╗\n';
        menuText += `║ ${meta.emoji} *${meta.label}* — ${commands.length} command${commands.length === 1 ? '' : 's'}${' '.repeat(Math.max(0, 28 - meta.label.length - String(commands.length).length - 12))}║\n`;
        menuText += '╠═══════════════════════════════════════╣\n';

        // Commands
        for (const cmd of sortedCommands) {
          const aliases = cmd.aliases && cmd.aliases.length > 0
            ? ` (${cmd.aliases.join(', ')})`
            : '';
          // Bold wraps tightly around the command, then pad with spaces
          const cmdStr = `${cmdPrefix}${cmd.triggers}`;
          const pad = ' '.repeat(Math.max(0, 14 - cmdStr.length));
          menuText += `║ ▸ *${cmdStr}*${pad}${aliases}\n`;
        }
        menuText += '╚═══════════════════════════════════════╝\n\n';
      }

      // === INSTALLED PLUGINS (if any) ===
      const installedCats = Object.keys(installedCommands);
      if (installedCats.length > 0) {
        menuText += '╔═══════════════════════════════════════╗\n';
        menuText += `║ 🧩 *INSTALLED PLUGINS* — ${installedCats.length} categor${installedCats.length === 1 ? 'y' : 'ies'}\n`;
        menuText += '╚═══════════════════════════════════════╝\n\n';

        for (const category of installedCats) {
          const commands = installedCommands[category] || [];
          const meta = metaFor(category);
          const sortedCommands = commands.sort((a, b) =>
            a.triggers.localeCompare(b.triggers)
          );

          menuText += `*${meta.emoji} ${meta.label}*\n`;
          for (const cmd of sortedCommands) {
            const aliases = cmd.aliases && cmd.aliases.length > 0
              ? ` (${cmd.aliases.join(', ')})`
              : '';
            menuText += `  ▸ *${cmdPrefix}${cmd.triggers}*${aliases}\n`;
          }
          menuText += '\n';
        }
      }

      // === DIVIDER ===
      menuText += '═══════════════════════════════════════\n\n';

      // === SUMMARY + FOOTER ===
      menuText += '╔═══════════════════════════════════════╗\n';
      menuText += '║ 📊 *SUMMARY*                            ║\n';
      menuText += '╠═══════════════════════════════════════╣\n';
      menuText += `║ Total: *${totalCmds} commands* / *${totalCategories} categories*\n`;
      menuText += '║                                       ║\n';
      menuText += '║ ♻️ *Powered by NIKOLA MD* ♻️              ║\n';
      menuText += '╚═══════════════════════════════════════╝\n';

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
      console.error('NIKOLA MD menu error:', error);
      await Cypher.sendMessage(
        m.chat,
        {
          text: '⚠️ An error occurred while generating the NIKOLA MD menu. Please try again later.'
        },
        { quoted: m }
      );
    }
  }
});
