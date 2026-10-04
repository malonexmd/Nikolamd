/**
 * NIKOLA MD — AFK (Away From Keyboard)
 * Marks a user as AFK with an optional reason.
 * Persists to a JSON file so AFK status survives bot restarts.
 */

const fs = require('fs');
const path = require('path');

const AFK_FILE = path.join(__dirname, '..', 'tmp', 'afk-state.json');

function loadState() {
  try {
    if (!fs.existsSync(AFK_FILE)) return {};
    return JSON.parse(fs.readFileSync(AFK_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    const dir = path.dirname(AFK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(AFK_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('NIKOLA MD afk save error:', e.message);
  }
}

module.exports = () => ({
  name: "AFK Status",
  triggers: ["afk", "away"],
  react: "💤",
  description: "Mark yourself as away. Usage: .afk [reason]",
  category: "Utility",

  run: async ({ m, args, text }) => {
    const userId = m.sender || '';
    if (!userId) return m.reply('⚠️ Could not identify you.');

    const state = loadState();

    // If user is already AFK, this command clears it
    if (state[userId]) {
      const since = new Date(state[userId].since);
      const durationMs = Date.now() - since.getTime();
      const mins = Math.floor(durationMs / 60000);
      delete state[userId];
      saveState(state);

      return m.reply(
        `👋 *Welcome back, <@${userId.split('@')[0]}>!*\n` +
        `💤 You were AFK for *${mins} minute(s)*.\n` +
        `📝 Reason: ${state[userId]?.reason || 'N/A'}\n\n` +
        `♻️ Powered by *NIKOLA MD*`
      );
    }

    // Set new AFK status
    const reason = (text || args.join(' ')).trim() || 'No reason given';
    state[userId] = {
      since: new Date().toISOString(),
      reason
    };
    saveState(state);

    m.reply(
      `💤 *<@${userId.split('@')[0]}> is now AFK*\n` +
      `📝 Reason: *${reason}*\n\n` +
      `♻️ Powered by *NIKOLA MD*`
    );
  }
});

// Export the state helpers for use by a future "auto-clear AFK when user sends a message" hook
module.exports.loadAfkState = loadState;
module.exports.saveAfkState = saveState;
module.exports.AFK_FILE = AFK_FILE;
