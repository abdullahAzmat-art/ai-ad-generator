import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';

// ─── Node ─────────────────────────────────────────────────────────────────────

export async function pexelsNode(state) {
  const { scraped, aspectRatio } = state;
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!pexelsKey) {
    console.warn('[Pexels Node] PEXELS_API_KEY missing — skipping.');
    return { stockImages: [] };
  }

  // ── 1. Ask Gemini for the best search category ───────────────────────────
  let category = 'business'; // safe fallback

  if (process.env.GEMINI_API_KEY && scraped) {
    // LangChain chain: model | string parser  (no manual fetch, no response drilling)
    const model = new ChatGoogleGenerativeAI({
      model      : 'gemini-2.5-flash-lite',
      apiKey     : process.env.GEMINI_API_KEY,
      temperature: 0.1,
      maxOutputTokens: 20,
    });

    const chain = model.pipe(new StringOutputParser());

    const prompt = `
Based on this scraped website data, output the single best Pexels search term
(e.g. "gym", "restaurant", "lawyer", "dentist", "coffee shop").
Output ONLY the search term — no quotes, no punctuation, nothing else.

Title       : ${scraped.title || ''}
Description : ${scraped.description || ''}
Text snippet: ${(scraped.pageText || '').slice(0, 500)}
`.trim();

    try {
      const raw = await chain.invoke([new HumanMessage(prompt)]);
      const cleaned = raw.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      if (cleaned) category = cleaned;
    } catch (err) {
      console.error('[Pexels Node] Gemini category call failed:', err.message);
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
