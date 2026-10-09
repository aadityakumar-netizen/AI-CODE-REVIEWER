
const env = require('../../config/env');

async function complete(prompt) {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not set.');
  }

  const model = env.geminiModel || 'gemini-2.5-flash';
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
            maxOutputTokens: 5000,
            responseMimeType: 'application/json',
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.error?.message || `HTTP ${response.status}`;
        const retryable = [429, 500, 502, 503, 504].includes(response.status);

        if (retryable && attempt < maxAttempts) {
          lastError = new Error(`Gemini request failed: ${message}`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }

        throw new Error(`Gemini request failed: ${message}`);
      }

      const candidate = data?.candidates?.[0];

      if (candidate?.finishReason === 'MAX_TOKENS') {
        lastError = new Error('Gemini response was truncated at the output token limit.');

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }

        throw lastError;
      }

      const result = candidate?.content?.parts
        ?.map(part => part?.text || '')
        .join('')
        .trim() || '';

      if (!result) {
        throw new Error('Gemini returned an empty response.');
      }

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        lastError = new Error('Gemini review timed out after 180 seconds.');
      } else {
        lastError = error;
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }

      throw lastError;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Gemini request failed.');
}

module.exports = { complete };
