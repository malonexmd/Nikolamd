

'use strict';

const yts  = require('yt-search');
const { isYouTubeUrl }     = require('../Functions/cod3uchiha-api.js');
const { downloadYtAudio }  = require('../Functions/media-dl.js');

module.exports = () => ({
  name: 'YouTube Audio Downloader',
  triggers: ['play', 'ytmp3', 'song', 'ytaudio'],
  description: 'Download YouTube audio. Accepts a URL or song name.',
  category: 'Downloader',
  react: '🎵',

  run: async ({ m, Cypher, text, prefix, command }) => {
    if (!text) {
      return m.reply(
        `*Usage:* ${prefix}${command} <URL or song name>\n` +
        `*Examples:*\n` +
        `  ${prefix}${command} https://youtube.com/watch?v=dQw4w9WgXcQ\n` +
        `  ${prefix}${command} Blinding Lights weeknd`
      );
    }

    try {
      let ytUrl    = text;
      let title    = text;
      let author   = '';
      let duration = '';

      if (!isYouTubeUrl(text)) {
        await m.reply(`🔍 Searching YouTube for *"${text}"*…`);

        const results = await yts(text);
        const video   = results?.videos?.[0];

        if (!video?.url) {
          return m.reply(`❌ No YouTube results found for *"${text}"*.`);
        }

        ytUrl    = video.url;
        title    = video.title     || text;
        author   = video.author?.name || '';
        duration = video.timestamp  || '';
      }

      const { buffer, mimetype, ext } = await downloadYtAudio(ytUrl);

      const safeTitle = title.replace(/[^\w\s]/gi, '').trim() || 'audio';

      await Cypher.sendMessage(
        m.chat,
        {
          audio:    buffer,
          mimetype: mimetype,
          fileName: `${safeTitle}.${ext}`,
          ptt:      false,
        },
        { quoted: m }
      );

    } catch (err) {
      return m.reply(
        `❌ *Download Error:* ${err.message || 'Request failed. Try again later.'}`
      );
    }
  },
});
