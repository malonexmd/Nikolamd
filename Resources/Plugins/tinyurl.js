const axios = require('axios');

module.exports = () => ({
  name: "URL Shortener",
  triggers: ["tinyurl", "shortlink"],
  react: "🔗",
  description: "Shortens long URLs using TinyURL",
  category: "Utility",

  run: async ({ m, text, prefix, command }) => {
    if (!text) return m.reply(`*Example: ${prefix + command} https://instagram.com/heyits_tylor*`);
    
    try {
      const response = await axios.get(`https://tinyurl.com/api-create.php?url=${text}`);
      m.reply(response.data);
    } catch (error) {
      console.error(error);
      m.reply('*An error occurred while shortening the URL.*');
    }
  }
});