/**
 * NIKOLA MD — Menu Command (KLASU-style format)
 *
 * Format: ┏▣ ◈ *TITLE* ◈  with ┃➽ command rows
 * - Header card shows bot info (NOT owner info — use .owner for that)
 * - Each category shown without command counts
 * - All text uses bold (*) for headers and key fields
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

let startTime = Date.now();

// Category display order + emoji + label
const CATEGORY_META = {
  'AI':            { emoji: '🤖', label: 'AI MENU' },
  'Developer':     { emoji: '💻', label: 'DEVELOPER MENU' },
  'Downloader':    { emoji: '📥', label: 'DOWNLOAD MENU' },
  'Entertainment': { emoji: '🎬', label: 'ENTERTAINMENT MENU' },
  'Finance':       { emoji: '💰', label: 'FINANCE MENU' },
  'Fun':           { emoji: '🎮', label: 'FUN MENU' },
  'Games':         { emoji: '🎯', label: 'GAMES MENU' },
  'General':       { emoji: '🌐', label: 'GENERAL MENU' },
  'Group':         { emoji: '👥', label: 'GROUP MENU' },
  'Group Admin':   { emoji: '🛡️', label: 'GROUP ADMIN MENU' },
  'Media':         { emoji: '🖼️', label: 'MEDIA MENU' },
  'Owner':         { emoji: '👑', label: 'OWNER MENU' },
  'Religion':      { emoji: '🛐', label: 'RELIGION MENU' },
  'Search':        { emoji: '🔍', label: 'SEARCH MENU' },
  'Settings':      { emoji: '⚙️', label: 'SETTINGS MENU' },
  'Tools':         { emoji: '🛠️', label: 'TOOLS MENU' },
  'Utility':       { emoji: '🔧', label: 'UTILITY MENU' },
  'Misc':          { emoji: '📦', label: 'MISC MENU' }
};

function metaFor(cat) {
  return CATEGORY_META[cat] || { emoji: '📦', label: (cat || 'MISC').toUpperCase() + ' MENU' };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 MB';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

function detectHost() {
  if (process.env.DYNO) return 'Heroku';
  if (process.env.KUBERNETES_SERVICE_HOST) return 'Kubernetes';
  if (process.env.RAILWAY_PROJECT_ID) return 'Railway';
  if (process.env.RENDER) return 'Render';
  if (process.env.CI) return 'CI';
  return 'Local';
}

function ramBar() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const percent = Math.round((used / total) * 100);
  const filled = Math.round(percent / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
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
      const t0 = performance.now();

      // Load the plugin registry exported by executor.js
      const executor = require('../Functions/executor.js');
      const plugins = executor.plugins || executor.registry || executor.map || executor;

      const allPlugins =
        plugins && typeof plugins.values === 'function'
          ? [...new Set(plugins.values())]
          : [];

      // Group plugins: builtin vs installed
      const builtinCommands = {};
      const installedCommands = {};

      for (const plugin of allPlugins) {
        if (!plugin || (!plugin.triggers && !plugin.name)) continue;
        const category = plugin.category || 'Misc';
        const triggers = Array.isArray(plugin.triggers) ? plugin.triggers : [plugin.triggers];
        if (triggers.length === 0 || !triggers[0]) continue;

        const entry = {
          triggers: triggers[0],
          aliases: triggers.slice(1)
        };

        if (plugin.installed) {
          if (!installedCommands[category]) installedCommands[category] = [];
          installedCommands[category].push(entry);
        } else {
          if (!builtinCommands[category]) builtinCommands[category] = [];
          builtinCommands[category].push(entry);
        }
      }

      // === Build menu text ===
      let menuText = '';

      // === HEADER (BOT INFO) CARD ===
      const pkg = require('../../package.json');
      const version = pkg.version || '1.8.5';
      const pluginCount = allPlugins.length;
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const usedMem = totalMem - os.freemem();
      const uptime = formatUptime(Date.now() - startTime);
      const host = detectHost();
      const mode = process.env.BOT_MODE || 'Public';
      const latency = (performance.now() - t0).toFixed(2) + ' ms';

      menuText += '┏▣ ◈ *♻️ NIKOLA MD* ◈\n';
      menuText += `┃ *ᴘʀᴇғɪx* : [ ${cmdPrefix} ]\n`;
      menuText += `┃ *ʜᴏsᴛ* : ${host}\n`;
      menuText += `┃ *ᴘʟᴜɢɪɴs* : ${pluginCount}\n`;
      menuText += `┃ *ᴍᴏᴅᴇ* : ${mode}\n`;
      menuText += `┃ *ᴠᴇʀsɪᴏɴ* : ${version}\n`;
      menuText += `┃ *sᴘᴇᴇᴅ* : ${latency}\n`;
      menuText += `┃ *ᴜsᴀɢᴇ* : ${formatBytes(memUsage.rss)} of ${formatBytes(totalMem)}\n`;
      menuText += `┃ *ʀᴀᴍ* : ${ramBar()}\n`;
      menuText += `┃ *ᴜᴘᴛɪᴍᴇ* : ${uptime}\n`;
      menuText += '┗▣\n\n';

      // === COMMANDS BY CATEGORY ===
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
        const sortedCommands = commands.sort((a, b) => a.triggers.localeCompare(b.triggers));

        // Category header
        menuText += `┏▣ ◈ *${meta.emoji} ${meta.label}* ◈\n`;
        for (const cmd of sortedCommands) {
          menuText += `┃➽ ${cmdPrefix}${cmd.triggers}\n`;
        }
        menuText += '┗▣\n\n';
      }

      // === INSTALLED PLUGINS (if any) ===
      const installedCats = Object.keys(installedCommands);
      for (const category of installedCats) {
        const commands = installedCommands[category] || [];
        if (commands.length === 0) continue;
        const meta = metaFor(category);
        const sortedCommands = commands.sort((a, b) => a.triggers.localeCompare(b.triggers));
        menuText += `┏▣ ◈ *${meta.emoji} ${meta.label}* ◈\n`;
        for (const cmd of sortedCommands) {
          menuText += `┃➽ ${cmdPrefix}${cmd.triggers}\n`;
        }
        menuText += '┗▣\n\n';
      }

      // === FOOTER ===
      menuText += '┏▣ ◈ *♻️ NIKOLA MD* ◈\n';
      menuText += '┃ Type *.owner* for owner info\n';
      menuText += '┃ Type *.alive* for bot status\n';
      menuText += '┗▣\n';

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
