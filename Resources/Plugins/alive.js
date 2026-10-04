/**
 * NIKOLA MD — Alive Command
 * Shows bot status, uptime, plugin count and version.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

let startTime = Date.now();

function formatUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function countPlugins() {
  try {
    const pluginDir = path.join(__dirname);
    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
    return files.length;
  } catch {
    return 'N/A';
  }
}

module.exports = () => ({
  name: "Alive Command",
  triggers: ["alive", "online", "status"],
  react: "♻️",
  description: "Check if the bot is alive and shows bot status.",
  category: "Utility",

  run: async ({ m, Cypher, sessionId }) => {
    try {
      const settings = require('../../settings.js');
      const pkg = require('../../package.json');
      const uptime = formatUptime(Date.now() - startTime);
      const pluginCount = countPlugins();
      const now = new Date().toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const text =
        `♻️ *NIKOLA MD is Alive!*\n\n` +
        `👑 Owner: *Nikola MD*\n` +
        `⚡ Uptime: *${uptime}*\n` +
        `🚀 Plugins: *${pluginCount}*\n` +
        `📅 Date: *${now}*\n` +
        `🔄 Version: *${pkg.version || '1.8.5'}*\n` +
        `🌐 Session: *@${sessionId}*\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      await Cypher.sendMessage(
        m.chat,
        {
          text,
          mentions: [sessionId]
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('NIKOLA MD alive error:', error);
      m.reply('⚠️ Failed to fetch bot status. Please try again later.');
    }
  }
});
