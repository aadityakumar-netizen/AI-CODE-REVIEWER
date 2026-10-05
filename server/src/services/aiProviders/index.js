const env = require('../../config/env');

const ollamaProvider = require('./ollamaProvider');
const geminiProvider = require('./geminiProvider');

const providers = {
  ollama: ollamaProvider,
  gemini: geminiProvider,
};

function getAIProvider() {
  const provider = providers[env.aiProvider];

  if (!provider) {
    throw new Error(
      `Unknown AI_PROVIDER "${env.aiProvider}". Supported providers: ${Object.keys(
        providers
      ).join(', ')}`
    );
  }

  return provider;
}

module.exports = getAIProvider;