/**
 * NIKOLA MD — Song Preview Player
 *
 * Sends a 30-second preview of any song as a WhatsApp voice message.
 * Uses the iTunes Search API (100% free, no API key required).
 *
 * Apple provides 30-second preview clips for nearly every song in the
 * iTunes Store — these are officially licensed by Apple for preview
 * purposes, so this is 100% legal.
 *
 * Usage:
 *   .preview <song name>
 *   .preview <song name> by <artist>
 *
 * Example:
 *   .preview Blinding Lights
 *   .preview Bohemian Rhapsody by Queen
 */

const axios = require('axios');

module.exports = () => ({
  name: "Song Preview",
  triggers: ["preview", "songpreview", "listen"],
  react: "🎵",
  description: "Get a 30-second song preview. Usage: .preview <song name>",
  category: "Music",

  run: async ({ m, Cypher, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🎵 *NIKOLA MD Song Preview*\n\n` +
        `*Usage:* .preview <song name>\n` +
        `*Examples:*\n` +
        `  .preview Blinding Lights\n` +
        `  .preview Bohemian Rhapsody by Queen\n\n` +
        `📋 Returns a 30-second official preview (licensed by Apple).\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      // Search iTunes for the song
      const res = await axios.get('https://itunes.apple.com/search', {
        params: {
          term: text,
          media: 'music',
          entity: 'song',
          limit: 5
        },
        timeout: 8000,
        headers: { 'User-Agent': 'NIKOLA-MD/1.0' }
      });

      const results = res.data?.results || [];
      if (results.length === 0) {
        return m.reply(`⚠️ No songs found for *"${text}"*. Try different keywords.`);
      }

      // Pick the first result with a preview URL
      const song = results.find(r => r.previewUrl) || results[0];
      if (!song.previewUrl) {
        return m.reply(`⚠️ Found *${song.trackName}* by *${song.artistName}* but no preview is available for this track.`);
      }

      const title = song.trackName || 'Unknown';
      const artist = song.artistName || 'Unknown';
      const album = song.collectionName || '';
      const duration = song.trackTimeMillis ? `${Math.floor(song.trackTimeMillis / 60000)}:${String(Math.floor((song.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}` : 'N/A';
      const releaseDate = song.releaseDate ? new Date(song.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
      const genre = song.primaryGenreName || 'Unknown';
      const price = song.trackPrice ? `${song.trackPrice} ${song.currency || 'USD'}` : 'N/A';
      const cover = song.artworkUrl100?.replace('100x100', '300x300') || song.artworkUrl100;
      const itunesUrl = song.trackViewUrl || '';

      // Download the 30s preview (mp4 audio, convert to mp3 for WhatsApp)
      let audioBuf;
      try {
        const previewRes = await axios.get(song.previewUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          maxContentLength: 5 * 1024 * 1024 // 5MB max
        });
        audioBuf = Buffer.from(previewRes.data, 'binary');
      } catch (dlErr) {
        console.error('NIKOLA MD preview download error:', dlErr.message);
        return m.reply(`⚠️ Could not download preview for *${title}*. Try again later.`);
      }

      // iTunes previews are M4A (MP4 audio). WhatsApp prefers MP3.
      // Try to convert with ffmpeg; if that fails, send as-is (M4A).
      let finalBuf = audioBuf;
      let mimetype = 'audio/mp4';
      let ext = 'm4a';

      try {
        const ffmpeg = require('fluent-ffmpeg');
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        ffmpeg.setFfmpegPath(ffmpegPath);
        const { PassThrough } = require('stream');

        const converted = await new Promise((resolve, reject) => {
          const chunks = [];
          const stream = new PassThrough();
          stream.on('data', c => chunks.push(c));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);

          ffmpeg(require('stream').Readable.from(audioBuf))
            .format('mp3')
            .noVideo()
            .on('error', reject)
            .pipe(stream, { end: true });
        });

        if (converted.length > 1000) {
          finalBuf = converted;
          mimetype = 'audio/mpeg';
          ext = 'mp3';
        }
      } catch (convErr) {
        console.log('Preview conversion failed, sending as M4A:', convErr.message);
      }

      // Send cover image with metadata first
      const caption =
        `🎵 *Song Preview*\n\n` +
        `📌 Title: ${title}\n` +
        `👤 Artist: ${artist}\n` +
        `${album ? `💿 Album: ${album}\n` : ''}` +
        `⏱ Duration: ${duration} (preview: 30s)\n` +
        `📅 Released: ${releaseDate}\n` +
        `🎭 Genre: ${genre}\n` +
        `💵 Price: ${price}\n\n` +
        `${itunesUrl ? `🔗 Listen full: ${itunesUrl}\n\n` : ''}` +
        `♻️ Powered by *NIKOLA MD* (iTunes Search API)`;

      if (cover) {
        try {
          const coverRes = await axios.get(cover, { responseType: 'arraybuffer', timeout: 5000 });
          const coverBuf = Buffer.from(coverRes.data, 'binary');
          await Cypher.sendMessage(
            m.chat,
            {
              image: coverBuf,
              caption,
              mimetype: 'image/jpeg'
            },
            { quoted: m }
          );
        } catch {
          await m.reply(caption);
        }
      } else {
        await m.reply(caption);
      }

      // Send the 30s preview as a voice message
      const safeTitle = title.replace(/[^\w\s.-]/g, '').trim() || 'preview';
      await Cypher.sendMessage(
        m.chat,
        {
          audio: finalBuf,
          mimetype,
          ptt: true,
          fileName: `${safeTitle}.${ext}`
        },
        { quoted: m }
      );

      await m.reply(`✅ *30-second preview sent!* Tap ▶️ to play.`);

    } catch (error) {
      console.error('NIKOLA MD preview error:', error.message);

      if (error.response?.status === 400) {
        m.reply('⚠️ Invalid search query. Try different keywords.');
      } else if (error.code === 'ECONNABORTED') {
        m.reply('⚠️ iTunes API request timed out. Try again.');
      } else {
        m.reply('⚠️ Could not fetch song preview. ' + (error.message || ''));
      }
    }
  }
});
