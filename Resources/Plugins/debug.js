const { prettyResult, truncate } = require('../Functions/inspect.js');

module.exports = () => ({
  name: "Debug Eval",
  triggers: ["eval"],
  description: "Evaluate and debug expressions",
  category: "Developer",
  owner: true,
  react: "🐛",

  run: async ({ m, Cypher, args, text, db, sessionId }) => {
    if (!text) {
      return m.reply(
        `🐛 *Debug Eval Command*\n\n` +
        `Usage:\n` +
        `.eval m.chat - Get chat ID\n` +
        `.eval m.sender - Get sender JID\n` +
        `.eval m.key - Get message key\n` +
        `.eval Cypher.user - Get bot user info\n` +
        `.eval m.mentionedJid - Get mentioned JIDs\n` +
        `.eval m - Dump entire message object\n\n` +
        `Tip: \`.eval\` is the obfuscation-safe option — use it when \`> <expr>\` stops working on protected builds.`
      );
    }

    try {
      const expression = text.trim();

      const context = { m, Cypher, args, db, sessionId };

      const body = expression.includes('await') || /\breturn\b/.test(expression)
        ? `return (async () => { ${expression} })()`
        : `return (${expression})`;

      const evaluator = new Function(...Object.keys(context), body);
      let result = evaluator(...Object.values(context));
      if (result && typeof result.then === 'function') result = await result;

      const output = truncate(prettyResult(result), 10000);

      return m.reply(
        `🐛 *Debug Result*\n\n` +
        `*Expression:* \`${expression}\`\n\n` +
        `*Result:*\n\`\`\`\n${output}\n\`\`\``
      );
    } catch (error) {
      const stack = (error.stack || '').split('\n').slice(0, 4).join('\n');
      return m.reply(
        `❌ *Error*\n\n` +
        `*Expression:* \`${text}\`\n\n` +
        `*Error:*\n\`\`\`\n${error.message}\n${stack}\n\`\`\``
      );
    }
  }
});
