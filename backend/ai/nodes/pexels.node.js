import 'dotenv/config';
import { getOpenRouterClient } from '../lib/openrouter.js';

// ─── Node ─────────────────────────────────────────────────────────────────────

export async function pexelsNode(state) {
  const { scraped, aspectRatio } = state;
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!pexelsKey) {
    console.warn('[Pexels Node] PEXELS_API_KEY missing — skipping.');
    return { stockImages: [] };
  }

  // ── 1. Ask Model for the best search category ───────────────────────────
  let category = 'business'; // safe fallback

  if (process.env.OPENROUTER_API_KEY && scraped) {
    const client = getOpenRouterClient();

    const prompt = `
Based on this scraped website data, output the single best Pexels search term
(e.g. "gym", "restaurant", "lawyer", "dentist", "coffee shop").
Output ONLY the search term — no quotes, no punctuation, nothing else.

Title       : ${scraped.title || ''}
Description : ${scraped.description || ''}
Text snippet: ${(scraped.pageText || '').slice(0, 500)}
`.trim();

    try {
      const apiResponse = await client.chat.completions.create({
        model: 'qwen/qwen3.8-27b:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 20,
        reasoning: { enabled: true }
      });
      
      const raw = apiResponse.choices[0].message.content || '';
      const cleaned = raw.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      if (cleaned) category = cleaned;
    } catch (err) {
      console.error('[Pexels Node] OpenRouter category call failed:', err.message);
    }
  }

  console.log(`[Pexels Node] Searching Pexels for: "${category}"`);

  // ── 2. Fetch stock photos from Pexels ────────────────────────────────────
  const orientation =
    aspectRatio === '16:9' ? 'landscape' :
    aspectRatio === '1:1'  ? 'square'    :
    'portrait';

  const stockImages = [];

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(category)}&per_page=3&orientation=${orientation}`,
      { headers: { Authorization: pexelsKey } }
    );

    if (res.ok) {
      const data = await res.json();
      stockImages.push(
        ...(data.photos ?? []).map(p => p.src.large2x || p.src.large || p.src.original)
      );
    } else {
      console.error('[Pexels Node] Pexels API error:', await res.text());
    }
  } catch (err) {
    console.error('[Pexels Node] Pexels fetch failed:', err.message);
  }

  console.log(`[Pexels Node] Found ${stockImages.length} stock images.`);
  return { stockImages };
}
