import 'dotenv/config';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getLlmClient, hasLlmProvider, GROQ_FAST_MODEL } from '../lib/llm.js';

const AdTypeSchema = z.object({
  adType: z.enum(['product', 'service', 'business']).describe("The type of advertisement we are making based on the website content"),
});

export async function detectAdTypeNode(state) {
  if (process.env.USE_MOCK_DATA === '1') {
    console.warn('[Detect Ad Type Node] USE_MOCK_DATA=1 — returning canned adType.');
    return { adType: 'product' };
  }

  const scraped = state.scraped;
  
  if (!scraped) {
    return { adType: 'business' }; // fallback
  }

  if (!hasLlmProvider()) {
    console.warn('[Detect Ad Type Node] No LLM API key (OPENROUTER_API_KEY / GROQ_API_KEY) — defaulting adType.');
    return { adType: 'business' };
  }

  const client = getLlmClient();
  const jsonSchema = zodToJsonSchema(AdTypeSchema);
  delete jsonSchema.$schema;

  const prompt = `
Analyze the following website data and decide what kind of advertisement we should make.
Is the primary offering a physical PRODUCT, a professional SERVICE, or a general BUSINESS / BRAND awareness?

Title: ${scraped.title || ''}
Description: ${scraped.description || ''}
Page Text: ${(scraped.pageText || '').slice(0, 3000)}
  `.trim();

  try {
    const apiResponse = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      groqModel: GROQ_FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an Advertisement strategist. Your purpose is to identify the ad type based on website content.
Output ONLY valid JSON matching this exact structure:

{
  "adType": "product" // or "service" or "business"
}

Output NO markdown formatting. Do not include markdown code blocks (like \`\`\`json). Just the raw JSON object.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = apiResponse.choices?.[0]?.message?.content;
    if (content) {
      const cleanContent = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const rawJson = JSON.parse(cleanContent);
      const parsed = AdTypeSchema.parse(rawJson);
      console.log(`[Detect Ad Type Node] Detected adType: ${parsed.adType}`);
      return { adType: parsed.adType };
    }
  } catch (err) {
    console.error('[Detect Ad Type Node] LLM classification failed:', err);
  }

  // Fallback
  return { adType: 'business' };
}
