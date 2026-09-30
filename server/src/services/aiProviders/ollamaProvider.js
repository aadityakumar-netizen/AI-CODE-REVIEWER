const env = require('../../config/env');

async function complete(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(`${env.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: env.ollamaModel,
        prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0,
          num_predict: 1200,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Ollama request failed with status ${response.status}: ${text}`
      );
    }

    const data = await response.json();
    const result = typeof data.response === 'string' ? data.response.trim() : '';

    console.log('OLLAMA RAW RESPONSE:', result);

    if (!result) {
      throw new Error('Ollama returned an empty response.');
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Ollama review timed out after 180 seconds.');
    }

    if (error.message.startsWith('Ollama request failed')) {
      throw error;
    }

    if (error.message.startsWith('Ollama returned an empty')) {
      throw error;
    }

    throw new Error(
      `Could not reach Ollama at ${env.ollamaBaseUrl}. Is Ollama running? (${error.message})`
    );
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { complete };
