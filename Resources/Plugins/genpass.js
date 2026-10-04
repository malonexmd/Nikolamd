module.exports = () => ({
  name: "Password generation Command",
  triggers: ["genpass", "genpassword"],
  react: "🔑",
  description: "Generates random strong passwords.",
  category: "Utility",

  run: async ({ m, Cypher, text }) => {
      let length = text ? parseInt(text) : 12;
      let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let pass = "";
      for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      try {
        Cypher.sendMessage(m.chat, { text: pass }, { quoted: m });
      } catch (error) {
        console.error('Error generating password:', error);
        m.reply('An error occurred while generating the password.');
      }

 }
});