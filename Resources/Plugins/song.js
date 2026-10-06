/**
 * NIKOLA MD — YouTube Song Search
 *
 * Uses the official YouTube Data API v3 to search for songs.
 * Returns metadata (title, channel, duration, thumbnail, URL).
 *
 * Requires: YOUTUBE_API_KEY env var
 *   Get a free key at: https://console.cloud.google.com/apis/library/youtube.googleapis.com
 *   (Free quota: 10,000 units/day — search costs 100 units, so ~100 searches/day)
 *
 * This plugin does NOT download or convert YouTube audio.
 * It only shows search results and a link to watch on YouTube.
 *
 * For MP3 conversion, you must:
 *   1. Own the original audio file, OR
 *   2. Have explicit written permission from the rights holder, OR
 *   3. Use content explicitly released under CC-BY or similar
 * In those cases, you can upload the original file directly to WhatsApp
 * without needing to extract it from YouTube.
 */

const axios = require('axios');

// ISO 8601 duration parser (PT1H2M3S -> 1:02:03)
function parseDuration(iso) {
  if (!iso) return 'N/A';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 'N/A';
  const h = parseInt(m[1] || 0, 10);
  const min = parseInt(m[2] || 0, 10);
  const s = parseInt(m[3] || 0, 10);
  if (h > 0) {
    return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${min}:${String(s).padStart(2, '0')}`;
}

// Format view count
function formatViews(n) {
  if (!n) return 'N/A';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

// Format published date
function formatDate(iso) {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

module.exports = () => ({
  name: "YouTube Song Search",
  triggers: ["ytsearch", "ytsong", "findsong"],
  react: "🎵",
  description: "Search YouTube for a song (metadata only). Usage: .ytsearch <query or URL>",
  category: "Search",

  run: async ({ m, Cypher, args, text }) => {
    if (!text || args.length === 0) {
      return m.reply(
        `🎵 *NIKOLA MD Song Search*\n\n` +
        `*Usage:* .ytsearch <song name or YouTube URL>\n` +
        `*Examples:*\n` +
        `  .ytsearch Bohemian Rhapsody\n` +
        `  .ytsearch https://youtube.com/watch?v=...\n\n` +
        `♻️ Powered by *NIKOLA MD* (YouTube Data API v3)`
      );
    }

    // Extract video ID if user passed a YouTube URL
    let videoIdFromUrl = null;
    const urlPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
      /^[A-Za-z0-9_-]{11}$/
    ];
    for (const pattern of urlPatterns) {
      const match = text.match(pattern);
      if (match) {
        videoIdFromUrl = match[1];
        break;
      }
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return m.reply(
        `⚠️ *YouTube API key not configured.*\n\n` +
        `The bot owner needs to:\n` +
        `1. Get a free key from https://console.cloud.google.com/apis/library/youtube.googleapis.com\n` +
        `2. Set the YOUTUBE_API_KEY environment variable\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      let videoId, title, channel, duration, views, published, thumbnail, description;

      if (videoIdFromUrl) {
        // User passed a URL — fetch that video's details directly
        videoId = videoIdFromUrl;

        const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            id: videoId,
            key: apiKey
          },
          timeout: 8000
        });

        if (!detailsRes.data.items || detailsRes.data.items.length === 0) {
          return m.reply(`⚠️ Video not found or unavailable.`);
        }

        const v = detailsRes.data.items[0];
        title = v.snippet.title;
        channel = v.snippet.channelTitle;
        duration = parseDuration(v.contentDetails.duration);
        views = formatViews(v.statistics?.viewCount);
        published = formatDate(v.snippet.publishedAt);
        thumbnail = v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url;
        description = v.snippet.description || '';
      } else {
        // Search YouTube for the query
        const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: text,
            type: 'video',
            maxResults: 1,
            videoEmbeddable: true,
            key: apiKey
          },
          timeout: 8000
        });

        if (!searchRes.data.items || searchRes.data.items.length === 0) {
          return m.reply(`⚠️ No results found for *${text}*. Try a different query.`);
        }

        const item = searchRes.data.items[0];
        videoId = item.id.videoId;
        title = item.snippet.title;
        channel = item.snippet.channelTitle;
        thumbnail = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url;
        description = item.snippet.description || '';

        // Fetch additional details (duration, views, publish date)
        try {
          const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
              part: 'contentDetails,statistics',
              id: videoId,
              key: apiKey
            },
            timeout: 8000
          });
          if (detailsRes.data.items?.[0]) {
            const v = detailsRes.data.items[0];
            duration = parseDuration(v.contentDetails.duration);
            views = formatViews(v.statistics?.viewCount);
            published = formatDate(v.snippet.publishedAt);
          }
        } catch {
          duration = 'N/A';
          views = 'N/A';
          published = 'N/A';
        }
      }

      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const shortDesc = description.slice(0, 150).replace(/\n+/g, ' ');
      const truncatedDesc = description.length > 150 ? shortDesc + '...' : shortDesc;

      const caption =
        `🎵 *Song Found*\n\n` +
        `📌 *Title:* ${title}\n` +
        `👤 *Channel:* ${channel}\n` +
        `⏱ *Duration:* ${duration}\n` +
        `👀 *Views:* ${views}\n` +
        `📅 *Published:* ${published}\n\n` +
        `🔗 *Watch on YouTube:*\n${watchUrl}\n\n` +
        `${truncatedDesc ? `📝 ${truncatedDesc}\n\n` : ''}` +
        `♻️ Powered by *NIKOLA MD*`;

      // Try to send the thumbnail image with the caption
      if (thumbnail) {
        try {
          const imgRes = await axios.get(thumbnail, {
            responseType: 'arraybuffer',
            timeout: 8000
          });
          const imgBuf = Buffer.from(imgRes.data, 'binary');

          await Cypher.sendMessage(
            m.chat,
            {
              image: imgBuf,
              caption,
              mimetype: 'image/jpeg'
            },
            { quoted: m }
          );
        } catch (imgErr) {
          console.error('NIKOLA MD song thumbnail error:', imgErr.message);
          // Fallback: text-only
          m.reply(caption);
        }
      } else {
        m.reply(caption);
      }
    } catch (error) {
      console.error('NIKOLA MD song error:', error.message);

      if (error.response?.status === 403) {
        if (error.response.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
          m.reply('⚠️ YouTube API daily quota exceeded. Try again tomorrow.');
        } else if (error.response.data?.error?.errors?.[0]?.reason === 'keyInvalid') {
          m.reply('⚠️ YouTube API key is invalid. Bot owner needs to check the YOUTUBE_API_KEY env var.');
        } else {
          m.reply('⚠️ YouTube API access denied (403). Check API key and YouTube Data API v3 enablement in Google Cloud Console.');
        }
      } else if (error.response?.status === 400) {
        m.reply('⚠️ Invalid search query. Try different keywords.');
      } else if (error.code === 'ECONNABORTED') {
        m.reply('⚠️ YouTube API request timed out. Try again.');
      } else {
        m.reply('⚠️ Could not search YouTube. ' + (error.message || ''));
      }
    }
  }
});
