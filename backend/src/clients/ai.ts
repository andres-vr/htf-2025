/**
 * Minimal AI client wrapper. Currently supports OpenAI-compatible API via
 * process.env.OPENAI_API_KEY. If no key is provided the caller should handle
 * the absence and fall back to a non-AI strategy.
 */
export async function callOpenAI(prompt: string, max_tokens = 256, model = 'gpt-3.5-turbo') {
  // Read the OpenAI key from environment variables. Do NOT commit secrets into
  // source control. If you need to run locally, set OPENAI_API_KEY in your
  // environment or use a .env file (which must be added to .gitignore).
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '';
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  const body = {
    model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant specialized in time series extrapolation.' },
      { role: 'user', content: prompt }
    ],
    max_tokens,
    temperature: 0.2
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`OpenAI call failed: ${res.status} ${res.statusText} ${t}`);
  }

  const json: any = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  return content;
}
