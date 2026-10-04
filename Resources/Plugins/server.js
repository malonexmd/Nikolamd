/**
 * NIKOLA MD — Server Info
 * Shows server RAM, CPU, uptime, OS info.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

let startTime = Date.now();

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

module.exports = () => ({
  name: "Server Info",
  triggers: ["server", "sysinfo", "host"],
  react: "🖥️",
  description: "Show server info (RAM, CPU, uptime).",
  category: "Utility",

  run: async ({ m }) => {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

      const cpuCount = os.cpus().length;
      const cpuModel = os.cpus()[0]?.model || 'Unknown';
      const loadAvg = os.loadavg();
      const load1m = loadAvg[0].toFixed(2);
      const load5m = loadAvg[1].toFixed(2);
      const load15m = loadAvg[2].toFixed(2);

      const botUptime = formatUptime(Date.now() - startTime);
      const osUptime = formatUptime(os.uptime() * 1000);

      const hostname = os.hostname();
      const platform = `${os.type()} ${os.release()}`;
      const arch = os.arch();
      const nodeVersion = process.version;

      // Plugin count
      let pluginCount = 'N/A';
      try {
        const pluginDir = path.join(__dirname);
        pluginCount = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js')).length;
      } catch {}

      const reply =
        `🖥️ *NIKOLA MD — Server Info*\n\n` +
        `📊 *Memory:*\n` +
        `• Used: *${formatBytes(usedMem)} / ${formatBytes(totalMem)}* (${memPercent}%)\n` +
        `• Free: *${formatBytes(freeMem)}*\n\n` +
        `⚡ *CPU:*\n` +
        `• Cores: *${cpuCount}*\n` +
        `• Model: *${cpuModel}*\n` +
        `• Load (1/5/15m): *${load1m} / ${load5m} / ${load15m}*\n\n` +
        `⏱ *Uptime:*\n` +
        `• Bot: *${botUptime}*\n` +
        `• OS:  *${osUptime}*\n\n` +
        `🌐 *System:*\n` +
        `• Hostname: *${hostname}*\n` +
        `• Platform: *${platform}*\n` +
        `• Architecture: *${arch}*\n` +
        `• Node.js: *${nodeVersion}*\n\n` +
        `🚀 Plugins loaded: *${pluginCount}*\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      console.error('NIKOLA MD server error:', error.message);
      m.reply('⚠️ Could not fetch server info.');
    }
  }
});
