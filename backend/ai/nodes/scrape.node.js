import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { scrapeUrl } from '../lib/firecrawl.js';
import { getOpenRouterClient } from '../lib/openrouter.js';

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
  // 1. Keep existing Firecrawl setup
  const scraped = await scrapeUrl(state.url);
  
  const { title, description, pageText, images, logo, brandColor } = scraped;
  
  // 2. Extract richer data via LLM
  let extracted = {};
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const client = getOpenRouterClient();
      const jsonSchema = zodToJsonSchema(ExtractedDataSchema, 'ExtractedData');
      
      const prompt = \`
Extract structured information from the following website content.
Title: \${title}
Description: \${description}
Page Text: \${pageText.slice(0, 4000)}
      \`.trim();
      
      const apiResponse = await client.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Extract the website information into the requested JSON schema accurately.'
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
            name: 'ExtractedData',
            strict: true,
            schema: jsonSchema,
          },
        },
      });
      
      const content = apiResponse.choices?.[0]?.message?.content;
      if (content) {
        const rawJson = JSON.parse(content);
        extracted = ExtractedDataSchema.parse(rawJson);
      }
    } catch (err) {
      console.error('[Scrape Node] LLM extraction failed:', err);
      // Fallback to empty extracted data
    }
  } else {
    console.warn('[Scrape Node] OPENROUTER_API_KEY missing — skipping LLM extraction.');
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