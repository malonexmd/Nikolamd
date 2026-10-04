const moment = require('moment-timezone');

module.exports = () => ({
  name: "Time Command",
  triggers: ["time", "date"],
  react: "⏰",
  description: "Displays the time and date.",
  category: "Utility",

  run: async ({ m, Cypher, db }) => {
const now = moment().tz(db.timezone);
      const timeInfo = `
      *🔹 CURRENT TIME 🔹*

🔸 *Day:* ${now.format('dddd')}
🔸 *Time:* ${now.format('HH:mm:ss')}
🔸 *Date:* ${now.format('LL')}
🔸 *Timezone:* ${db.timezone}
`;
  m.reply(timeInfo.trim());
 }
});