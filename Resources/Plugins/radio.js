/**
 * NIKOLA MD — Internet Radio Player
 *
 * Plays live internet radio stations in WhatsApp voice messages.
 * Uses the free Radio Browser API (https://api.radio-browser.info)
 * — no API key required, 30,000+ stations worldwide.
 *
 * Usage:
 *   .radio              — random popular station
 *   .radio lofi         — search by genre/keyword
 *   .radio <name>       — search by station name
 *
 * The bot downloads ~60 seconds of audio and sends it as a voice message.
 * User can request again to get the next 60 seconds.
 */

const axios = require('axios');

// Pick a random Radio Browser server (they have multiple mirrors)
async function getServer() {
  try {
    const res = await axios.get('https://all.api.radio-browser.info/json/servers', { timeout: 5000 });
    const servers = res.data;
    if (servers && servers.length > 0) {
      const random = servers[Math.floor(Math.random() * servers.length)];
      return `https://${random.name}`;
    }
  } catch {}
  return 'https://de1.api.radio-browser.info';
}

async function searchStations(query) {
  const server = await getServer();
  try {
    if (!query) {
      // Top voted stations
      const res = await axios.get(`${server}/json/stations/topvote/10`, { timeout: 8000 });
      return res.data || [];
    }
    // Try by name first
    const nameRes = await axios.get(`${server}/json/stations/byname/${encodeURIComponent(query)}`, {
      params: { limit: 10, order: 'votes', reverse: true },
      timeout: 8000
    });
    let stations = nameRes.data || [];

    // If nothing by name, try by tag (genre)
    if (stations.length === 0) {
      const tagRes = await axios.get(`${server}/json/stations/bytag/${encodeURIComponent(query)}`, {
        params: { limit: 10, order: 'votes', reverse: true },
        timeout: 8000
      });
      stations = tagRes.data || [];
    }
    return stations;
  } catch (error) {
    console.error('NIKOLA MD radio search error:', error.message);
    return [];
  }
}

async function downloadStreamSnippet(streamUrl, durationMs = 60000) {
  // Use ffmpeg to grab 60s of audio from the live stream and convert to MP3
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  ffmpeg.setFfmpegPath(ffmpegPath);

  const { PassThrough } = require('stream');
  const buf = new PassThrough();
  const chunks = [];

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
    }, durationMs + 5000);

    const proc = ffmpeg(streamUrl)
      .format('mp3')
      .noVideo()
      .duration(durationMs / 1000)
      .on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      })
      .on('end', () => {
        clearTimeout(timeout);
        resolve(Buffer.concat(chunks));
      });

    buf.on('data', (c) => chunks.push(c));
    proc.pipe(buf, { end: true });
  });
}

module.exports = () => ({
  name: "Internet Radio Player",
  triggers: ["radio", "fm", "station"],
  react: "📻",
  description: "Play live internet radio. Usage: .radio [genre or station name]",
  category: "Music",

  run: async ({ m, Cypher, args, text }) => {
    if (!process.env.RADIO_ENABLED && process.env.RADIO_ENABLED !== 'false') {
      // Default: enabled. Set RADIO_ENABLED=false to disable.
    }
    if (process.env.RADIO_ENABLED === 'false') {
      return m.reply('⚠️ Radio feature is disabled by the bot owner.');
    }

    const query = (text || '').trim();

    try {
      // Acknowledge
      await m.reply(query
        ? `📻 Searching for stations matching *"${query}"*...`
        : '📻 Picking a popular station for you...'
      );

      const stations = await searchStations(query);

      // Filter to stations with working stream URLs
      const valid = stations.filter(s => s.url_resolved || s.url);
      if (valid.length === 0) {
        return m.reply(`⚠️ No stations found for *"${query}"*. Try: lofi, jazz, pop, news, classical, hip-hop`);
      }

      // Pick a random one from top 5
      const station = valid[Math.floor(Math.random() * Math.min(5, valid.length))];
      const streamUrl = station.url_resolved || station.url;

      if (!streamUrl) {
        return m.reply('⚠️ Station found but stream URL is broken. Try again.');
      }

      // Send station info
      const info =
        `📻 *Now Playing: ${station.name?.trim() || 'Unknown Station'}*\n\n` +
        `🎵 Genre: ${station.tags || 'various'}\n` +
        `🌍 Country: ${station.country || 'Unknown'}\n` +
        ` bitrate: ${station.bitrate || 'N/A'} kbps\n` +
        ` votes: ${station.votes || 0}\n\n` +
        `⏺ Recording 60 seconds of live audio...`;

      await m.reply(info);

      // Try to record 60s of audio
      try {
        const audioBuf = await downloadStreamSnippet(streamUrl, 60000);

        if (!audioBuf || audioBuf.length < 1000) {
          return m.reply('⚠️ Could not record audio from this station. Try another.');
        }

        // Send as voice message (ptt: true makes it a voice note)
        await Cypher.sendMessage(
          m.chat,
          {
            audio: audioBuf,
            mimetype: 'audio/mpeg',
            ptt: true,
            fileName: `${(station.name || 'radio').replace(/[^\w\s.-]/g, '')}.mp3`
          },
          { quoted: m }
        );

        await m.reply(
          `✅ *60-second radio snippet sent!*\n\n` +
          `🔁 Type *.radio ${query || ''}* again for another station\n` +
          `📡 Live stream: ${streamUrl}\n\n` +
          `♻️ Powered by *NIKOLA MD* (Radio Browser API)`
        );
      } catch (recordErr) {
        console.error('NIKOLA MD radio record error:', recordErr.message);
        return m.reply(
          `⚠️ Could not record from this station (it may be offline or geo-blocked).\n\n` +
          `📡 Try the live stream directly: ${streamUrl}`
        );
      }
    } catch (error) {
      console.error('NIKOLA MD radio error:', error.message);
      m.reply('⚠️ Radio lookup failed. Try again later.');
    }
  }
});
