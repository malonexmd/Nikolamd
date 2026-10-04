const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getRandom } = require('../Functions/mains2.js')

module.exports = () => ({
  name: "Sticker to Image",
  triggers: ["toimage", "toimg"],
  react: "🖼️",
  description: "Converts stickers to images",
  category: "Media",

  run: async ({ Cypher, m, args, prefix, command }) => {
    const quoted = m.quoted || m.msg?.quoted;
    const mime = quoted?.mimetype || quoted?.msg?.mimetype;
    if (!quoted || !/webp/.test(mime)) {
      return m.reply(`*Send or reply to a sticker with the caption ${prefix + command}*`);
    }

    try {
      const media = await quoted.download();
      const inputPath = path.join(__dirname, getRandom('.webp'));
      fs.writeFileSync(inputPath, media);
      const outputPath = path.join(__dirname, getRandom('.png'));
      exec(`ffmpeg -i ${inputPath} ${outputPath}`, (err) => {
        fs.unlinkSync(inputPath); 

        if (err) {
          console.error('Error converting to image:', err);
          return m.reply('An error occurred while converting the sticker to an image.');
        }
        const buffer = fs.readFileSync(outputPath);
        Cypher.sendMessage(m.chat, { image: buffer }, { quoted: m });    
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error('Error converting to image:', error);
      m.reply('An error occurred while converting the sticker to an image.');
    }
  }
});