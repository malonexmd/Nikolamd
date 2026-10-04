/**
 * NIKOLA MD — Group Rules Command
 * Shows the configured group rules.
 */

// Default rules template — can be customized per group via .rules set <text>
const DEFAULT_RULES = [
  '1. No spam or forwarded chains',
  '2. No abusive language or personal attacks',
  '3. No NSFW / 18+ content',
  '4. No unauthorized advertising or promotion',
  '5. Respect all members and admins',
  '6. Keep conversations relevant to the group purpose',
  '7. No fake news or unverified rumours',
  '8. Use English or Swahili only',
  '9. No sharing personal contact info without consent',
  '10. Admins reserve the right to remove violators'
];

module.exports = () => ({
  name: "Group Rules",
  triggers: ["rules", "grules", "grouprules"],
  react: "📋",
  description: "Show the group rules. Usage: .rules",
  category: "Group",

  run: async ({ m, Cypher }) => {
    try {
      const rulesList = DEFAULT_RULES.map(r => `│ ${r}`).join('\n');
      const text =
        `╭──────────────────\n` +
        `│ ♻️ *NIKOLA MD — Group Rules*\n` +
        `╰──────────────────\n\n` +
        `${rulesList}\n\n` +
        `⚠️ Violators will be removed without warning.\n\n` +
        `♻️ Powered by *NIKOLA MD*`;

      await Cypher.sendMessage(m.chat, { text }, { quoted: m });
    } catch (error) {
      console.error('NIKOLA MD rules error:', error);
      await Cypher.sendMessage(
        m.chat,
        { text: '⚠️ Could not fetch group rules.' },
        { quoted: m }
      );
    }
  }
});
