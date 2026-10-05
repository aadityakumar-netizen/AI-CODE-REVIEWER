const env = require('../../config/env');

async function complete(prompt) {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const model = env.geminiModel || 'gemini-2.5-flash';

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data?.error?.message ||
        `Gemini request failed with status ${response.status}`;

      throw new Error(message);
    }

    const result =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim() || '';

    if (!result) {
      throw new Error('Gemini returned an empty response.');
    }

    console.log('GEMINI RESPONSE RECEIVED');

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Gemini review timed out after 180 seconds.');
    }

    if (
      error.message.includes('Gemini request failed') ||
      error.message.includes('API key') ||
      error.message.includes('quota') ||
      error.message.includes('permission')
    ) {
      throw error;
    }

    throw new Error(`Could not reach Gemini API. (${error.message})`);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { complete };