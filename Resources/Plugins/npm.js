/**
 * NIKOLA MD — NPM Package Info
 * Uses the NPM registry API (free, no key required).
 */

const axios = require('axios');

module.exports = () => ({
  name: "NPM Package Info",
  triggers: ["npm", "npmpackage"],
  react: "📦",
  description: "Get NPM package info. Usage: .npm <package>",
  category: "Developer",

  run: async ({ m, args, text }) => {
    const pkg = (text || '').trim().replace(/^@/, '');
    if (!pkg) {
      return m.reply(
        `📦 *NIKOLA MD NPM*\n\n` +
        `*Usage:* .npm <package>\n` +
        `*Example:* .npm baileys\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      const res = await axios.get(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`, { timeout: 8000 });
      const d = res.data || {};
      const latest = d['dist-tags']?.latest;
      const ver = d.versions?.[latest] || {};
      const time = d.time?.[latest];
      const created = d.time?.created;
      const modified = d.time?.modified;

      if (!latest) {
        return m.reply(`⚠️ Package *${pkg}* not found on NPM.`);
      }

      const deps = Object.keys(ver.dependencies || {});
      const depList = deps.length === 0
        ? '(none)'
        : deps.length <= 8
          ? deps.join(', ')
          : deps.slice(0, 8).join(', ') + ` +${deps.length - 8} more`;

      const fmtDate = str => str ? new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

      let reply = `📦 *${ver.name || pkg}*\n\n`;
      reply += `🔖 Latest version: *${latest}*\n`;
      if (ver.license) reply += `📜 License: *${ver.license}*\n`;
      if (ver.author?.name) reply += `👤 Author: *${ver.author.name}*\n`;
      if (ver.homepage) reply += `🏠 Homepage: ${ver.homepage}\n`;
      if (ver.repository?.url) reply += `🔗 Repo: ${ver.repository.url.replace('git+', '').replace('.git', '')}\n`;
      reply += `\n`;
      reply += `📅 Published: *${fmtDate(time)}*\n`;
      reply += `🕐 First release: *${fmtDate(created)}*\n`;
      reply += `🔄 Last modified: *${fmtDate(modified)}*\n\n`;
      if (ver.description) reply += `📝 ${ver.description}\n\n`;
      reply += `📚 Dependencies (${deps.length}): ${depList}\n\n`;
      reply += `📥 Install: \`npm i ${pkg}\`\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      if (error.response?.status === 404) {
        m.reply(`⚠️ Package *${pkg}* not found on NPM.`);
      } else {
        console.error('NIKOLA MD npm error:', error.message);
        m.reply('⚠️ Could not fetch NPM package info. Try again later.');
      }
    }
  }
});
