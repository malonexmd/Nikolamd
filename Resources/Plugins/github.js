/**
 * NIKOLA MD — GitHub User Info
 * Uses GitHub REST API (free, no key for public users — has rate limits).
 */

const axios = require('axios');

module.exports = () => ({
  name: "GitHub User Info",
  triggers: ["github", "gh", "githubuser"],
  react: "🐙",
  description: "Get GitHub user profile info. Usage: .github <username>",
  category: "Search",

  run: async ({ m, args, text }) => {
    const username = (text || '').trim().replace(/^@/, '');
    if (!username) {
      return m.reply(
        `🐙 *NIKOLA MD GitHub*\n\n` +
        `*Usage:* .github <username>\n` +
        `*Example:* .github malonexmd\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        timeout: 8000,
        headers: { 'Accept': 'application/vnd.github+json' }
      });

      const u = res.data || {};
      if (!u.login) {
        return m.reply(`⚠️ GitHub user *@${username}* not found.`);
      }

      const created = u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
      const updated = u.updated_at ? new Date(u.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

      let reply = `🐙 *GitHub Profile*\n\n`;
      reply += `📛 Name: *${u.name || u.login}*\n`;
      reply += `👤 Username: *@${u.login}*\n`;
      if (u.company) reply += `🏢 Company: *${u.company}*\n`;
      if (u.location) reply += `📍 Location: *${u.location}*\n`;
      if (u.blog) reply += `🔗 Blog: *${u.blog}*\n`;
      if (u.email) reply += `📧 Email: *${u.email}*\n`;
      if (u.bio) reply += `📝 Bio: ${u.bio}\n`;
      if (u.twitter_username) reply += `🐦 Twitter: *@${u.twitter_username}*\n`;
      reply += `\n`;
      reply += `📊 *Stats:*\n`;
      reply += `• Repositories: *${u.public_repos || 0}*\n`;
      reply += `• Followers: *${u.followers || 0}*\n`;
      reply += `• Following: *${u.following || 0}*\n`;
      reply += `• Joined: *${created}*\n`;
      reply += `• Last updated: *${updated}*\n\n`;
      reply += `🌐 Profile: ${u.html_url}\n\n`;
      reply += `♻️ Powered by *NIKOLA MD*`;

      m.reply(reply);
    } catch (error) {
      if (error.response?.status === 404) {
        m.reply(`⚠️ GitHub user *@${username}* not found.`);
      } else if (error.response?.status === 403) {
        m.reply('⚠️ GitHub API rate limit reached. Try again in a few minutes.');
      } else {
        console.error('NIKOLA MD github error:', error.message);
        m.reply('⚠️ Could not fetch GitHub profile. Try again later.');
      }
    }
  }
});
