const questions = [
  "Would you rather be able to fly or be invisible?",
  "Would you rather live in the past or the future?",
  "Would you rather have more time or more money?",
  "Would you rather be famous or rich?",
  "Would you rather read minds or predict the future?",
  "Would you rather have no internet or no phone?",
  "Would you rather be too hot or too cold?",
  "Would you rather lose all your old memories or never make new ones?",
  "Would you rather have a pause button or a rewind button on your life?",
  "Would you rather always be 10 minutes late or 20 minutes early?",
  "Would you rather never use social media again or never watch another movie/TV show?",
  "Would you rather be stuck on a broken ski lift or in a broken elevator?",
  "Would you rather have a photographic memory or an IQ of 200?",
  "Would you rather be able to talk to animals or speak all foreign languages?",
  "Would you rather have unlimited battery life on your phone or unlimited mobile data?",
  "Would you rather live without music or without TV?",
  "Would you rather be the funniest person or the smartest person?",
  "Would you rather explore space or the ocean?",
  "Would you rather have free Wi-Fi wherever you go or free coffee?",
  "Would you rather be able to teleport or time travel?",
  "Would you rather never lose your phone again or never lose your keys again?",
  "Would you rather have a personal chef or a personal driver?",
  "Would you rather live 100 years in the past or 100 years in the future?",
  "Would you rather have unlimited respect or unlimited power?",
  "Would you rather be a genius nobody knows or famous but average intelligence?"
];

module.exports = () => ({
  name: "Would You Rather",
  triggers: ["wyr", "wouldyourather"],
  description: "Play Would You Rather game",
  category: "Games",
  react: "🤔",

  run: async ({ m, Cypher }) => {
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    return m.reply(
      `🤔 *Would You Rather*\n\n` +
      `${question}\n\n` +
      `💭 Answer in the group!`
    );
  }
});