const env = require('../../config/env');
const ollamaProvider = require('./ollamaProvider');

// Every provider module must implement the same shape: { complete(prompt) }.
// Adding a new provider later (e.g. a hosted API) means writing one new
// file with a `complete` function and adding one line to this map —
// nothing else in the app needs to know or care which provider is active.
const providers = {
  ollama: ollamaProvider,
};

function getAIProvider() {
  const provider = providers[env.aiProvider];

  if (!provider) {
    throw new Error(
      `Unknown AI_PROVIDER "${env.aiProvider}". Supported providers: ${Object.keys(providers).join(', ')}`
    );
  }

  return provider;
}

module.exports = getAIProvider;
