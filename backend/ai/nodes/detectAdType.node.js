import 'dotenv/config';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getOpenRouterClient } from '../lib/openrouter.js';

const AdTypeSchema = z.object({
  adType: z.enum(['product', 'service', 'business']).describe("The type of advertisement we are making based on the website content"),
});

export async function detectAdTypeNode(state) {
  const scraped = state.scraped;
  
  if (!scraped) {
    return { adType: 'business' }; // fallback
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[Detect Ad Type Node] OPENROUTER_API_KEY missing — defaulting adType.');
    return { adType: 'business' };
  }

  const client = getOpenRouterClient();
  const jsonSchema = zodToJsonSchema(AdTypeSchema, 'AdType');

  const prompt = `
Analyze the following website data and decide what kind of advertisement we should make.
Is the primary offering a physical PRODUCT, a professional SERVICE, or a general BUSINESS / BRAND awareness?

Title: ${scraped.title || ''}
Description: ${scraped.description || ''}
Page Text: ${(scraped.pageText || '').slice(0, 3000)}
  `.trim();

  try {
    const apiResponse = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are an Advertisement strategist. Your purpose is to identify the ad type based on website content. Output valid JSON matching the schema.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'AdType',
          strict: true,
          schema: jsonSchema,
        }
      }
    });

    const content = apiResponse.choices?.[0]?.message?.content;
    if (content) {
      const rawJson = JSON.parse(content);
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
