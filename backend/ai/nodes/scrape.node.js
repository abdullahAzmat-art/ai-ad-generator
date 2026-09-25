import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { scrapeUrl } from '../lib/firecrawl.js';
import { getLlmClient, hasLlmProvider, GROQ_FAST_MODEL } from '../lib/llm.js';
import { mockScraped } from '../lib/mockData.js';

const ExtractedDataSchema = z.object({
  brandInformation: z.object({
    name: z.string().describe("The name of the brand or company"),
    missionOrTagline: z.string().optional().describe("Brand's mission statement or tagline"),
  }),
  productInformation: z.object({
    mainProductOrService: z.string().describe("The primary product or service offered"),
    keyFeatures: z.array(z.string()).describe("List of key features, benefits or selling points"),
    targetAudience: z.string().describe("The inferred target audience"),
    pricingOrOffers: z.string().optional().describe("Any pricing information or special offers found"),
  }),
  fonts: z.array(z.string()).describe("List of font families mentioned or used"),
  colors: z.array(z.string()).describe("List of color hex codes or names found in the text, apart from primary brand color"),
  ctaHints: z.array(z.string()).describe("Suggested call-to-actions based on website goals (e.g., 'Book Now', 'Start Free Trial')"),
  contactBusinessInformation: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    socialMedia: z.array(z.string()).optional(),
  }),
});

export async function scrapeNode(state) {
  if (process.env.USE_MOCK_DATA === '1') {
    console.warn('[Scrape Node] USE_MOCK_DATA=1 — returning canned scrape data.');
    return { scraped: mockScraped() };
  }

  // 1. Keep existing Firecrawl setup
  const scraped = await scrapeUrl(state.url);
  
  const { title, description, pageText, images, logo, brandColor } = scraped;
  
  // 2. Extract richer data via LLM
  let extracted = {};
  if (hasLlmProvider()) {
    try {
      const client = getLlmClient();
      const systemPrompt = `
You are an expert data extractor. Extract the requested information into a structured JSON format.
You MUST reply with ONLY valid JSON matching this exact structure:

{
  "brandInformation": {
    "name": "string",
    "missionOrTagline": "string"
  },
  "productInformation": {
    "mainProductOrService": "string",
    "keyFeatures": ["string", "string"],
    "targetAudience": "string",
    "pricingOrOffers": "string"
  },
  "fonts": ["string"],
  "colors": ["string"],
  "ctaHints": ["string"],
  "contactBusinessInformation": {
    "email": "string",
    "phone": "string",
    "address": "string",
    "socialMedia": ["string"]
  }
}

Do not include markdown blocks, just the JSON.
`.trim();
      
      const prompt = `
<website_content>
TITLE: ${title}
DESCRIPTION: ${description}
PAGE TEXT: ${pageText.slice(0, 4000)}
</website_content>

Extract the information based on the website content above.
      `.trim();
      
      const apiResponse = await client.chat.completions.create({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        groqModel: GROQ_FAST_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      
      const content = apiResponse.choices?.[0]?.message?.content;
      console.log('[Scrape Node] Raw LLM content:', content);
      
      if (content) {
        const cleanContent = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const rawJson = JSON.parse(cleanContent);
        console.log('[Scrape Node] Parsed JSON:', rawJson);
        extracted = ExtractedDataSchema.parse(rawJson);
      }
    } catch (err) {
      console.error('[Scrape Node] LLM extraction failed:', err);
      // Fallback to empty extracted data
    }
  } else {
    console.warn('[Scrape Node] No LLM API key (OPENROUTER_API_KEY / GROQ_API_KEY) — skipping LLM extraction.');
  }
  
  const allColors = [brandColor];
  if (extracted.colors && Array.isArray(extracted.colors)) {
    extracted.colors.forEach(c => {
      if (!allColors.includes(c)) allColors.push(c);
    });
  }

  // 3. Return everything in a clean structured object
  const richScraped = {
    // New structured format requested
    pageInformation: {
      title: title || '',
      description: description || '',
      text: pageText || '',
    },
    brandInformation: extracted.brandInformation || { name: title || '' },
    productInformation: extracted.productInformation || {
      mainProductOrService: '',
      keyFeatures: [],
      targetAudience: '',
    },
    images,
    logo,
    colors: allColors,
    fonts: extracted.fonts || [],
    ctaHints: extracted.ctaHints || [],
    contactBusinessInformation: extracted.contactBusinessInformation || {},

    // Kept for backward compatibility with existing nodes that rely on old flat structure
    title,
    description,
    pageText,
    brandColor,
  };
  
  return { scraped: richScraped };
}