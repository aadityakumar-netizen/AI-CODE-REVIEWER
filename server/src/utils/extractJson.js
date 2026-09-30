// LLMs are inconsistent about HOW they return JSON — sometimes clean,
// sometimes wrapped in ```json fences, sometimes with a sentence of
// commentary before or after it. This tries increasingly permissive
// strategies until one produces valid JSON, and throws a clear error
// if none of them do.
//
// This function only proves the text IS valid JSON — it says nothing
// about whether the JSON has the fields a Review needs. That's a
// separate validation step (Phase 11), deliberately kept apart from
// "can we even parse this at all".
function extractJson(text) {
  if (typeof text !== 'string') {
    throw new Error('Expected a string to extract JSON from.');
  }

  // Strategy 1: the whole response is already valid JSON.
  try {
    return JSON.parse(text);
  } catch {
    // fall through to the next strategy
  }

  // Strategy 2: JSON wrapped in a ```json ... ``` or ``` ... ``` fence.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fall through
    }
  }

  // Strategy 3: grab everything from the first '{' to the last '}' —
  // catches cases like "Here is the review:\n{...}\nLet me know if..."
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      // fall through
    }
  }

  throw new Error('Could not extract valid JSON from the AI response.');
}

module.exports = extractJson;
