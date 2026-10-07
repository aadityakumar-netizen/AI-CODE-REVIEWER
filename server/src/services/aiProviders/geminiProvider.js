const env = require('../../config/env');

async function complete(prompt) {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not set.');
  }

  const model = env.geminiModel || 'gemini-2.5-flash';

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.geminiApiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.error?.message || `HTTP ${response.status}`;

      throw new Error(`Gemini request failed: ${message}`);
    }

    const result =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || '')
        .join('')
        .trim() || '';

    if (!result) {
      throw new Error('Gemini returned an empty response.');
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Gemini review timed out after 180 seconds.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { complete };