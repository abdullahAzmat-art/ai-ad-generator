import 'dotenv/config';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getLlmClient, hasLlmProvider, GROQ_STRONG_MODEL } from '../lib/llm.js';
import { mockBlueprint } from '../lib/mockData.js';

const BlueprintSchema = z.object({
  structure: z.array(z.object({
    role: z.string().describe("e.g. HOOK, PRODUCT HERO, PROBLEM, etc."),
    purpose: z.string().describe("What this scene should do"),
    durationSec: z.number().describe("Recommended duration in seconds"),
    assetTypeNeeded: z.enum(['productHero', 'productSecondary', 'lifestyle', 'person', 'office', 'food', 'background', 'logo', 'any']).describe("The type of image asset needed for this scene")
  })).describe("The sequence of scenes for the ad"),
});

export async function blueprintNode(state) {
  if (process.env.USE_MOCK_DATA === '1') {
    console.warn('[Blueprint Node] USE_MOCK_DATA=1 — returning canned blueprint.');
    return { blueprint: mockBlueprint(), missingAssets: [] };
  }

  const { adType, assets } = state;
  
  if (!hasLlmProvider()) {
    console.warn('[Blueprint Node] No LLM API key (OPENROUTER_API_KEY / GROQ_API_KEY) — defaulting blueprint.');
    return {
      blueprint: [],
      missingAssets: []
    };
  }

  const client = getLlmClient();
  const jsonSchema = zodToJsonSchema(BlueprintSchema);
  delete jsonSchema.$schema;

  const availableAssetsStr = JSON.stringify({
    logo: assets?.logo ? 1 : 0,
    productHero: assets?.productHero ? 1 : 0,
    productSecondary: (assets?.productSecondary || []).length,
    lifestyle: (assets?.lifestyle || []).length,
    person: (assets?.person || []).length,
    office: (assets?.office || []).length,
    food: (assets?.food || []).length,
    background: (assets?.background || []).length,
  }, null, 2);

  const productDirection = adType === 'product'
    ? 'For this product ad, open with the strongest product packshot, use distinct productHero or productSecondary images for each product-focused scene, and finish with a branded CTA end card. Prefer clean isolated product images over lifestyle images.'
    : 'Use the visual asset that best supports each narrative scene.';

  const prompt = `
You are a Creative director / advertisement planner.
We are making an ad of type: ${adType?.toUpperCase() || 'BUSINESS'}.

Plan the scene-by-scene flow of the advertisement. Return exactly 3 to 5 scenes.
For each scene, specify its role (e.g., HOOK, PRODUCT HERO, BENEFITS, OFFER, CTA for Product ads; PROBLEM, SOLUTION, BENEFITS, TRUST, CTA for Service ads), its purpose, the duration (sum must be around 10-15s), and the specific type of image asset it requires.

${productDirection}

Available asset categories to choose from: productHero, productSecondary, lifestyle, person, office, food, background, logo, any.

Here are the quantities of assets we currently HAVE:
${availableAssetsStr}
  `.trim();

  try {
    const apiResponse = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      groqModel: GROQ_STRONG_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an Advertisement planner. Output ONLY valid JSON matching this exact structure:

{
  "structure": [
    {
      "role": "HOOK",
      "purpose": "Grab attention...",
      "durationSec": 3,
      "assetTypeNeeded": "lifestyle"
    }
  ]
}

Output exactly 3 to 5 items in the structure array.
Output NO markdown formatting. Do not include markdown code blocks (like \`\`\`json). Just the raw JSON object.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const content = apiResponse.choices?.[0]?.message?.content;
    if (content) {
      const cleanContent = content.replace(/^```(?:json)?\s*/i, '').replace(/\s* एसएससी\s*$/i, '').replace(/\s*```$/i, '').trim();
      const rawJson = JSON.parse(cleanContent);
      const parsed = BlueprintSchema.parse(rawJson);
      
      // Compute missing assets
      const missingAssets = [];
      
      // We need to check if we have enough assets of the required types
      // Copy available counts to decrement them
      const counts = {
        logo: assets?.logo ? 1 : 0,
        productHero: assets?.productHero ? 1 : 0,
        productSecondary: (assets?.productSecondary || []).length,
        lifestyle: (assets?.lifestyle || []).length,
        person: (assets?.person || []).length,
        office: (assets?.office || []).length,
        food: (assets?.food || []).length,
        background: (assets?.background || []).length,
        any: 999
      };

      for (const scene of parsed.structure) {
        const req = scene.assetTypeNeeded;
        if (counts[req] > 0) {
          counts[req]--;
        } else {
          missingAssets.push(req);
        }
      }

      console.log(`[Blueprint Node] Planned ${parsed.structure.length} scenes. Missing assets:`, missingAssets);
      
      return { 
        blueprint: parsed.structure,
        missingAssets
      };
    }
  } catch (err) {
    console.error('[Blueprint Node] LLM blueprint generation failed:', err);
  }

  return { blueprint: [], missingAssets: [] };
}
