import 'dotenv/config';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getLlmClient, hasLlmProvider, GROQ_FAST_MODEL } from '../lib/llm.js';
import { mockAssets } from '../lib/mockData.js';

const AssetClassificationSchema = z.object({
  logo: z.string().nullable().describe("The URL of the best logo image, or null if none"),
  productHero: z.string().nullable().describe("The strongest isolated product image, prioritizing a clean white or plain background, or null if none"),
  productSecondary: z.array(z.string()).describe("Additional distinct product images, prioritizing isolated product, packaging, side views, and clean white or plain backgrounds"),
  lifestyle: z.array(z.string()).describe("URLs of lifestyle images showing the product in use or people/ambiance"),
  person: z.array(z.string()).describe("URLs of images focused primarily on a person (e.g., founder, model)"),
  office: z.array(z.string()).describe("URLs of images showing an office, storefront, or building"),
  food: z.array(z.string()).describe("URLs of food images"),
  background: z.array(z.string()).describe("URLs of abstract, textural, or scenic background images"),
});

export async function classifyAssetsNode(state) {
  if (process.env.USE_MOCK_DATA === '1') {
    console.warn('[Classify Assets Node] USE_MOCK_DATA=1 — returning canned assets.');
    return { assets: mockAssets() };
  }

  const images = state.scraped?.images || [];
  const logoUrl = state.scraped?.logo;
  
  const allImages = [...new Set([logoUrl, ...images].filter(Boolean))];

  if (allImages.length === 0) {
    return {
      assets: {
        logo: null,
        productHero: null,
        productSecondary: [],
        lifestyle: [],
        person: [],
        office: [],
        food: [],
        background: []
      }
    };
  }

  if (!hasLlmProvider()) {
    console.warn('[Classify Assets Node] No LLM API key (OPENROUTER_API_KEY / GROQ_API_KEY) — skipping LLM classification.');
    return {
      assets: {
        logo: logoUrl || (images.length > 0 ? images[0] : null),
        productHero: images.length > 0 ? images[0] : null,
        productSecondary: images.slice(1),
        lifestyle: [],
        person: [],
        office: [],
        food: [],
        background: []
      }
    };
  }

  const client = getLlmClient();
  const jsonSchema = zodToJsonSchema(AssetClassificationSchema);
  delete jsonSchema.$schema;

  const contentParts = [
    {
      type: 'text',
      text: 'Analyze the following images and classify each URL into one of the categories in the schema. You must output the exact URLs provided.',
    }
  ];

  allImages.forEach((imgUrl, i) => {
    contentParts.push({ type: 'text', text: `Image ${i + 1} URL: ${imgUrl}` });
    contentParts.push({
      type: 'image_url',
      image_url: { url: imgUrl }
    });
  });

  try {
    const apiResponse = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an Image/asset organizer. Your purpose is to understand what each image actually is and categorize them.
For productHero and productSecondary, prioritize distinct product packshots that are isolated on a white or clean plain background. Use lifestyle only for contextual use shots.
CRITICAL: Use ONLY verified same-brand product images. Do not mix unrelated bottles, styles, or competitor products. If an image is an unrelated product, ignore it (do not include its URL).
Return ONLY valid JSON matching this exact structure:

{
  "logo": "url_string_or_null",
  "productHero": "url_string_or_null",
  "productSecondary": ["url_string"],
  "lifestyle": ["url_string"],
  "person": ["url_string"],
  "office": ["url_string"],
  "food": ["url_string"],
  "background": ["url_string"]
}

Output NO markdown formatting. Do not include markdown code blocks (like \`\`\`json). Just the raw JSON object.`
        },
        {
          role: 'user',
          content: contentParts
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = apiResponse.choices?.[0]?.message?.content;
    if (content) {
      const cleanContent = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const rawJson = JSON.parse(cleanContent);
      const parsed = AssetClassificationSchema.parse(rawJson);
      
      const filterUrl = (url) => allImages.includes(url) ? url : null;
      const filterUrls = (urls) => urls.filter(u => allImages.includes(u));

      const assets = {
        logo: filterUrl(parsed.logo) || logoUrl || null,
        productHero: filterUrl(parsed.productHero),
        productSecondary: filterUrls(parsed.productSecondary || []),
        lifestyle: filterUrls(parsed.lifestyle || []),
        person: filterUrls(parsed.person || []),
        office: filterUrls(parsed.office || []),
        food: filterUrls(parsed.food || []),
        background: filterUrls(parsed.background || []),
      };

      console.log('[Classify Assets Node] Successfully classified assets.');
      return { assets };
    }
  } catch (err) {
    console.error('[Classify Assets Node] LLM classification failed:', err);
  }

  return {
    assets: {
      logo: logoUrl || null,
      productHero: images.length > 0 ? images[0] : null,
      productSecondary: images.slice(1),
      lifestyle: [],
      person: [],
      office: [],
      food: [],
      background: []
    }
  };
}
