/**
 * NIKOLA MD — Podcast Finder & Player
 *
 * Finds podcasts by topic and sends episode audio.
 * Uses the iTunes Search API (100% free, no API key required).
 *
 * iTunes provides podcast episode URLs that point to the creator's
 * own RSS-hosted audio files. Downloading these is 100% legal because
 * podcasters explicitly publish their audio for public download/distribution.
 *
 * Usage:
 *   .podcast <topic>            — search for podcasts
 *   .podcast <topic> -latest    — get latest episode from top podcast
 *
 * Examples:
 *   .podcast true crime
 *   .podcast daily news -latest
 *   .podcast joe rogan
 */

const axios = require('axios');

module.exports = () => ({
  name: "Podcast Finder",
  triggers: ["podcast", "pods", "pod"],
  react: "🎙️",
  description: "Find podcasts. Usage: .podcast <topic> [-latest]",
  category: "Music",

  run: async ({ m, Cypher, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🎙️ *NIKOLA MD Podcast Finder*\n\n` +
        `*Usage:* .podcast <topic>\n` +
        `*Examples:*\n` +
        `  .podcast true crime\n` +
        `  .podcast daily news\n` +
        `  .podcast joe rogan\n\n` +
        `💡 Add *-latest* to auto-grab the newest episode.\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    // Check for -latest flag
    const wantLatest = text.toLowerCase().includes('-latest');
    const query = text.replace(/-latest/gi, '').trim();

    if (!query) {
      return m.reply('⚠️ Please provide a topic. Example: .podcast true crime');
    }

    try {
      // Search iTunes for podcasts
      const res = await axios.get('https://itunes.apple.com/search', {
        params: {
          term: query,
          media: 'podcast',
          limit: 5
        },
        timeout: 8000,
        headers: { 'User-Agent': 'NIKOLA-MD/1.0' }
      });

      const results = res.data?.results || [];
      if (results.length === 0) {
        return m.reply(`⚠️ No podcasts found for *"${query}"*. Try different keywords.`);
      }

      if (wantLatest) {
        // Fetch RSS feed for top result and get latest episode
        const podcast = results[0];
        const feedUrl = podcast.feedUrl;
        if (!feedUrl) {
          return m.reply(`⚠️ Found podcast *${podcast.collectionName}* but no RSS feed URL available.`);
        }

        await m.reply(`🎙️ Fetching latest episode from *${podcast.collectionName}*...`);

        try {
          // Fetch the RSS feed (XML)
          const feedRes = await axios.get(feedUrl, { timeout: 10000 });
          const xml = feedRes.data;

          // Parse the XML manually (lightweight regex extraction)
          // Look for the first <item> with an <enclosure> (audio file URL)
          const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
          if (!itemMatch) {
            return m.reply('⚠️ Could not find any episodes in this podcast feed.');
          }

          const item = itemMatch[1];
          const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
          const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"[^>]*>/);
          const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
          const descMatch = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);

          if (!enclosureMatch) {
            return m.reply('⚠️ Latest episode found but no audio file attached.');
          }

          const epTitle = titleMatch ? titleMatch[1].trim() : 'Latest Episode';
          const audioUrl = enclosureMatch[1];
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : 'Unknown date';
          const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').slice(0, 200) : '';

          // Download episode (limit to 5 minutes to avoid massive files)
          await m.reply(`⏬ Downloading: *${epTitle}* (this may take a minute)...`);

          try {
            const ffmpeg = require('fluent-ffmpeg');
            const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
            ffmpeg.setFfmpegPath(ffmpegPath);
            const { PassThrough, Readable } = require('stream');

            // Stream the audio through ffmpeg to truncate to 5 min and convert to MP3
            const maxDuration = 300; // 5 minutes

            const audioBuf = await new Promise((resolve, reject) => {
              const chunks = [];
              const outStream = new PassThrough();
              outStream.on('data', c => chunks.push(c));
              outStream.on('end', () => resolve(Buffer.concat(chunks)));
              outStream.on('error', reject);

              const req = axios.get(audioUrl, {
                responseType: 'stream',
                timeout: 30000,
                maxContentLength: 50 * 1024 * 1024 // 50MB max
              });

              req.then(response => {
                ffmpeg(response.data)
                  .format('mp3')
                  .noVideo()
                  .duration(maxDuration)
                  .on('error', reject)
                  .pipe(outStream, { end: true });
              }).catch(reject);
            });

            if (!audioBuf || audioBuf.length < 1000) {
              throw new Error('Empty audio buffer');
            }

            // Send cover + episode info
            const caption =
              `🎙️ *Podcast Episode*\n\n` +
              `📌 Show: ${podcast.collectionName}\n` +
              `👤 Host: ${podcast.artistName}\n` +
              `🎵 Episode: ${epTitle}\n` +
              `📅 Published: ${pubDate}\n\n` +
              `${desc ? `📝 ${desc}${desc.length >= 200 ? '...' : ''}\n\n` : ''}` +
              `⏱ Sent first 5 minutes as voice note\n` +
              `🔗 Full episode: ${audioUrl}\n\n` +
              `♻️ Powered by *NIKOLA MD* (iTunes Podcasts API)`;

            // Send podcast artwork
            if (podcast.artworkUrl100) {
              try {
                const coverUrl = podcast.artworkUrl100.replace('100x100', '300x300');
                const coverRes = await axios.get(coverUrl, { responseType: 'arraybuffer', timeout: 5000 });
                const coverBuf = Buffer.from(coverRes.data, 'binary');
                await Cypher.sendMessage(m.chat, {
                  image: coverBuf,
                  caption,
                  mimetype: 'image/jpeg'
                }, { quoted: m });
              } catch {
                await m.reply(caption);
              }
            } else {
              await m.reply(caption);
            }

            // Send the audio
            await Cypher.sendMessage(
              m.chat,
              {
                audio: audioBuf,
                mimetype: 'audio/mpeg',
                ptt: true,
                fileName: `${epTitle.replace(/[^\w\s.-]/g, '').trim().slice(0, 50) || 'podcast'}.mp3`
              },
              { quoted: m }
            );

            return await m.reply('✅ *Episode sent!* Tap ▶️ to play.');
          } catch (dlErr) {
            console.error('NIKOLA MD podcast download error:', dlErr.message);
            return m.reply(
              `⚠️ Could not download the episode audio (it may be too large or geo-blocked).\n\n` +
              `🔗 Direct link: ${audioUrl}`
            );
          }
        } catch (feedErr) {
          console.error('NIKOLA MD podcast feed error:', feedErr.message);
          return m.reply('⚠️ Could not fetch podcast feed. The RSS URL may be unreachable.');
        }
      }

      // No -latest flag: just show search results
      let reply = `🎙️ *Podcast Search Results*\n\n📋 *Query:* ${query}\n\n`;

      for (let i = 0; i < results.length; i++) {
        const p = results[i];
        reply += `${i + 1}. *${p.collectionName}*\n`;
        reply += `   👤 ${p.artistName}\n`;
        if (p.trackCount) reply += `   📚 ${p.trackCount} episodes\n`;
        if (p.primaryGenreName) reply += `   🎭 ${p.primaryGenreName}\n`;
        if (p.feedUrl) reply += `   🔗 RSS: ${p.feedUrl.slice(0, 80)}${p.feedUrl.length > 80 ? '...' : ''}\n`;
        reply += `\n`;
      }

      reply += `💡 To get the latest episode from the top result:\n`;
      reply += `   *.podcast ${query} -latest*\n\n`;
      reply += `♻️ Powered by *NIKOLA MD* (iTunes Podcasts API)`;

      // Send with cover of top result
      if (results[0]?.artworkUrl100) {
        try {
          const coverUrl = results[0].artworkUrl100.replace('100x100', '300x300');
          const coverRes = await axios.get(coverUrl, { responseType: 'arraybuffer', timeout: 5000 });
          const coverBuf = Buffer.from(coverRes.data, 'binary');
          return await Cypher.sendMessage(m.chat, {
            image: coverBuf,
            caption: reply,
            mimetype: 'image/jpeg'
          }, { quoted: m });
        } catch {}
      }

      return m.reply(reply);

    } catch (error) {
      console.error('NIKOLA MD podcast error:', error.message);

      if (error.response?.status === 400) {
        m.reply('⚠️ Invalid search query.');
      } else if (error.code === 'ECONNABORTED') {
        m.reply('⚠️ iTunes API timed out. Try again.');
      } else {
        m.reply('⚠️ Could not search podcasts. ' + (error.message || ''));
      }
    }
  }
});
