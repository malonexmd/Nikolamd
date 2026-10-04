const { generatePDF } = require('../Functions/mains.js')

module.exports = () => ({
  name: "Text to PDF Converter",
  triggers: ["texttopdf", "makepdf", "pdf"],
  react: "📄",
  description: "Converts text to PDF document",
  category: "Utility",
  
  run: async ({ m, Cypher, text }) => {
    if (!text) return m.reply('Please provide text to convert to PDF. Example: .pdf Hello, world!');

    try {
      const pdfBuffer = await generatePDF(text);
      
      await Cypher.sendMessage(
        m.chat, 
        { 
          document: pdfBuffer, 
          fileName: 'converted_text.pdf', 
          mimetype: 'application/pdf' 
        }, 
        { quoted: m }
      );
      
    } catch (error) {
      console.error('PDF generation error:', error);
      m.reply('❌ Failed to generate PDF. Please try again.');
    }
  }
});