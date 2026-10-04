/**
 * NIKOLA MD — Crypto Price
 * Uses CoinGecko free API (no key required).
 */

const axios = require('axios');

const COIN_ALIASES = {
  btc: 'bitcoin',
  eth: 'ethereum',
  usdt: 'tether',
  bnb: 'binancecoin',
  sol: 'solana',
  xrp: 'ripple',
  ada: 'cardano',
  doge: 'dogecoin',
  trx: 'tron',
  dot: 'polkadot',
  matic: 'matic-network',
  ltc: 'litecoin',
  shib: 'shiba-inu',
  avax: 'avalanche-2',
  uni: 'uniswap',
  link: 'chainlink'
};

module.exports = () => ({
  name: "Crypto Price",
  triggers: ["crypto", "coin", "price"],
  react: "💰",
  description: "Get current crypto price. Usage: .crypto <coin>",
  category: "Finance",

  run: async ({ m, args, text }) => {
    const raw = (text || '').toLowerCase().trim();
    const coinId = COIN_ALIASES[raw] || raw;

    if (!coinId) {
      return m.reply(
        `💰 *NIKOLA MD Crypto*\n\n` +
        `*Usage:* .crypto <coin>\n` +
        `*Examples:* .crypto btc, .crypto ethereum, .crypto doge\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}`, {
        timeout: 8000,
        params: { localization: false, tickers: false, market_data: true, community_data: false, developer_data: false, sparkline: false }
      });

      const c = res.data || {};
      const name = c.name || coinId;
      const symbol = (c.symbol || '').toUpperCase();
      const md = c.market_data || {};
      const usd = md.current_price?.usd;
      const change24h = md.price_change_percentage_24h;
      const change7d = md.price_change_percentage_7d;
      const high24 = md.high_24h?.usd;
      const low24 = md.low_24h?.usd;
      const marketCap = md.market_cap?.usd;
      const volume = md.total_volume?.usd;
      const rank = md.market_cap_rank;

      if (!usd) {
        return m.reply(`⚠️ No price data found for *${coinId}*. Check the coin name.`);
      }

      const fmt = n => {
        if (n == null) return 'N/A';
        if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
        if (n >= 1) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
        return '$' + n.toFixed(6);
      };

      const arrow = change24h >= 0 ? '🟢' : '🔴';

      let reply =
        `💰 *${name} (${symbol})*\n\n` +
        `💵 Price: *${fmt(usd)}*\n` +
        `${arrow} 24h change: *${(change24h || 0).toFixed(2)}%*\n` +
        `📊 7d change: *${(change7d || 0).toFixed(2)}%*\n\n` +
        `📈 24h High: *${fmt(high24)}*\n` +
        `📉 24h Low:  *${fmt(low24)}*\n\n` +
        `🏦 Market cap: *${fmt(marketCap)}*${rank ? ` (#${rank})` : ''}\n` +
        `🔁 24h volume: *${fmt(volume)}*\n\n` +
        `♻️ Powered by *NIKOLA MD* (data: CoinGecko)`;

      m.reply(reply);
    } catch (error) {
      if (error.response?.status === 404) {
        m.reply(`⚠️ Crypto *${coinId}* not found. Try a different name (e.g. .crypto btc).`);
      } else {
        console.error('NIKOLA MD crypto error:', error.message);
        m.reply('⚠️ Could not fetch crypto price. Try again later.');
      }
    }
  }
});
