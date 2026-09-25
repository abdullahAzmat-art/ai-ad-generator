import 'dotenv/config';
import { getLlmClient, hasLlmProvider, GROQ_FAST_MODEL } from '../lib/llm.js';

// ─── Node ─────────────────────────────────────────────────────────────────────

export async function pexelsNode(state) {
  if (process.env.USE_MOCK_DATA === '1') {
    console.warn('[Pexels Node] USE_MOCK_DATA=1 — skipping stock search.');
    return { stockImages: [] };
  }

  const { scraped, aspectRatio, missingAssets = [] } = state;
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!pexelsKey) {
    console.warn('[Pexels Node] PEXELS_API_KEY missing — skipping.');
    return { stockImages: [] };
  }

  if (missingAssets.length === 0) {
    return { stockImages: [] };
  }

  const stockImages = [];
  const client = hasLlmProvider() ? getLlmClient() : null;
  const uniqueMissing = [...new Set(missingAssets)];

  const orientation =
    aspectRatio === '16:9' ? 'landscape' :
    aspectRatio === '1:1'  ? 'square'    :
    'portrait';

  for (const assetType of uniqueMissing) {
    let category = 'business'; // fallback

    if (client && scraped) {
      const prompt = `
We need a "${assetType}" image for an advertisement.
Based on this scraped website data, output the single best Pexels search term to find this specific type of image.
For example, if assetType is "lifestyle" and the product is "luxury perfume", output "luxury perfume woman".
If assetType is "office" and it's a dental clinic, output "modern dental clinic".
If assetType is "productHero" or "productSecondary", use an isolated product packshot query with a white background, such as "luxury perfume bottle white background".
Output ONLY the search term — no quotes, no punctuation, nothing else.

Website Title: ${scraped.title || ''}
Description: ${scraped.description || ''}
Text snippet: ${(scraped.pageText || '').slice(0, 500)}
`.trim();

      try {
        const apiResponse = await client.chat.completions.create({
          model: 'nvidia/nemotron-3-super-120b-a12b:free',
          groqModel: GROQ_FAST_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 500,
          reasoning: { enabled: true }
        });
        
        const raw = apiResponse.choices[0].message.content || '';
        const cleaned = raw.trim().replace(/[^a-zA-Z0-9\s]/g, '');
        if (cleaned) category = cleaned;
      } catch (err) {
        console.error(`[Pexels Node] OpenRouter category call failed for ${assetType}:`, err.message);
      }
    }

    console.log(`[Pexels Node] Searching Pexels for ${assetType}: "${category}"`);

    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(category)}&per_page=2&orientation=${orientation}`,
        { headers: { Authorization: pexelsKey } }
      );

      if (res.ok) {
        const data = await res.json();
        stockImages.push(
          ...(data.photos ?? []).map(p => p.src.large2x || p.src.large || p.src.original)
        );
      } else {
        console.error(`[Pexels Node] Pexels API error for ${assetType}:`, await res.text());
      }
    } catch (err) {
      console.error(`[Pexels Node] Pexels fetch failed for ${assetType}:`, err.message);
    }
  }

  console.log(`[Pexels Node] Found ${stockImages.length} stock images to fill missing gaps.`);
  return { stockImages };
}
