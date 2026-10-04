

const { cod3api, downloadBuffer, isYouTubeUrl } = require('../Functions/cod3uchiha-api.js');

module.exports = () => ({
  name: 'YouTube Video Downloader',
  triggers: ['video', 'ytmp4', 'ytvideo', 'ytdl'],
  description: 'Download YouTube video (MP4). Accepts a URL or video name.',
  category: 'Downloader',
  react: '🎬',

  run: async ({ m, Cypher, text, prefix, command }) => {
    if (!text) {
      return m.reply(
        `*Usage:* ${prefix}${command} <URL or video name>\n` +
        `*Examples:*\n` +
        `  ${prefix}${command} https://youtube.com/watch?v=dQw4w9WgXcQ\n` +
        `  ${prefix}${command} never gonna give you up`
      );
    }

    try {
      let ytUrl = text;
      let title = text;
      let author = '';
      let duration = '';

      if (!isYouTubeUrl(text)) {
      
        const search = await cod3api('/downloaders/play', { query: text }, 20_000);
        const result = search.result;
        if (!result?.url) {
          return m.reply(`❌ No YouTube results found for *"${text}"*.`);
        }
        ytUrl    = result.url;
        title    = result.title    || text;
        author   = result.author   || '';
        duration = result.duration || '';
      }

      const json = await cod3api('/downloaders/ytmp4', { url: ytUrl }, 60_000);
      const downloadUrl = json?.data?.url;
      if (!downloadUrl) {
        return m.reply('❌ Could not retrieve download link. Please try again later.');
      }

      if (!title || title === text) title = json?.data?.title || title;

      const videoBuffer = await downloadBuffer(downloadUrl, 180_000);

      const caption = [
        `🎬 *${title}*`,
        author   ? `👤 ${author}`   : '',
        duration ? `⏱️ ${duration}` : '',
      ].filter(Boolean).join('\n');

      await Cypher.sendMessage(
        m.chat,
        {
          video: videoBuffer,
          mimetype: 'video/mp4',
          fileName: `${title.replace(/[^\w\s]/gi, '').trim() || 'video'}.mp4`,
          caption,
        },
        { quoted: m }
      );
    } catch (err) {
      return m.reply(
        `❌ *Download Error:* ${err.message || 'Request failed. Try again later.'}\n` +
        `_Tip: Make sure the video is publicly available and under 10 minutes._`
      );
    }
  },
});
