import 'dotenv/config';
import { z } from 'zod';
import { getOpenRouterClient } from '../lib/openrouter.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

// ─── Schema ───────────────────────────────────────────────────────────────────

// Layout semantics — your renderer controls actual coordinates
const LAYOUTS = z.enum([
  'full-bleed',       // asset covers the entire frame
  'product-center',   // product centered, text around it
  'product-right',    // product on the right, text on the left
  'product-left',     // product on the left, text on the right
  'top-text',         // headline on top half, asset on bottom
  'bottom-text',      // asset on top, text below
  'split',            // left / right equal halves
  'overlay',          // text overlaid on asset with opacity layer
]);

// Animation semantics — your renderer maps these to actual transitions
const ANIMATIONS = z.enum([
  'slow-zoom',        // Ken Burns style zoom in
  'fade-in',          // simple opacity fade
  'slide-up',         // text / element slides up into position
  'product-reveal',   // dramatic product entrance
  'slide-right',      // wipe from left
  'pulse',            // subtle scale pulse
  'none',             // static
]);

const SceneSchema = z.object({
  role: z.string().describe(
    "The narrative role of this scene from the blueprint (e.g. hook, product-hero, benefits, offer, cta, problem, solution, trust)"
  ),
  layout: LAYOUTS.describe(
    "Semantic layout name. Your renderer maps this to pixel coordinates."
  ),
  assetRole: z.enum([
    'productHero', 'productSecondary', 'lifestyle',
    'person', 'office', 'food', 'background', 'logo', 'any'
  ]).describe("Which classified asset category should be used for this scene's visual"),
  headline: z.string().describe("The main headline text for this scene (max 8 words)"),
  subtext: z.string().describe("Optional supporting text (max 12 words). Empty string if not needed."),
  cta: z.string().describe("Call-to-action button text. Empty string if this scene has no CTA."),
  voiceover: z.string().describe("Voiceover script that fits the scene duration (max 2.5 words/sec)"),
  durationSec: z.number().describe("Scene duration in seconds (between 2 and 6)"),
  animation: ANIMATIONS.describe("Semantic animation name for this scene"),
});

const ScriptSchema = z.object({
  scenes: z.array(SceneSchema).describe("Ordered list of scenes following the blueprint structure"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormat(aspectRatio) {
  if (aspectRatio === '16:9') return 'banner';
  if (aspectRatio === '1:1') return 'square';
  return 'story';
}

function buildPrompt(state, feedback, previousScript) {
  const {
    scraped,
    adType = 'business',
    assets = {},
    blueprint = [],
    aspectRatio = '9:16',
  } = state;

  const {
    title = '',
    description = '',
    pageText = '',
    brandColor = '#10B981',
  } = scraped || {};

  const brand = scraped?.brandInformation || { name: title };
  const product = scraped?.productInformation || {};
  const colors = (scraped?.colors || [brandColor]).join(', ');
  const fonts = (scraped?.fonts || []).join(', ') || 'not specified';
  const ctaHints = (scraped?.ctaHints || []).join(', ') || 'not specified';

  // Summarise which asset categories are available
  const assetSummary = Object.entries({
    logo: assets?.logo ? 1 : 0,
    productHero: assets?.productHero ? 1 : 0,
    productSecondary: (assets?.productSecondary || []).length,
    lifestyle: (assets?.lifestyle || []).length,
    person: (assets?.person || []).length,
    office: (assets?.office || []).length,
    food: (assets?.food || []).length,
    background: (assets?.background || []).length,
  })
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `  • ${type}: ${count} image(s)`)
    .join('\n') || '  • none — rely on "any" or "background"';

  // Describe the blueprint plan
  const blueprintStr = blueprint.length
    ? blueprint
        .map((step, i) =>
          `  Scene ${i + 1}: [${step.role}] — ${step.purpose} (${step.durationSec}s, needs: ${step.assetTypeNeeded})`
        )
        .join('\n')
    : '  Not specified — use standard structure for this adType.';

  let feedbackSection = '';
  if (feedback && feedback.length > 0) {
    feedbackSection = `
=== FEEDBACK FROM PREVIOUS ATTEMPT ===
Fix ALL of the following issues:
${feedback.map(f => `  - ${f}`).join('\n')}

Previous script:
${JSON.stringify(previousScript, null, 2)}
`;
  }

  return `
You are a Creative copy + scene planner for high-converting video advertisements.

Your job is to write each scene's copy and decide its visual layout and animation.
DO NOT choose pixel coordinates — only semantic names.
Your renderer code will translate layout names into actual positions.

=== BRAND ===
Name        : ${brand.name || title}
Tagline     : ${brand.missionOrTagline || description}
Page text   : ${pageText.slice(0, 2000)}

=== PRODUCT / SERVICE ===
Offering    : ${product.mainProductOrService || 'not specified'}
Key features: ${(product.keyFeatures || []).join(', ') || 'not specified'}
Audience    : ${product.targetAudience || 'general'}
Pricing     : ${product.pricingOrOffers || 'not specified'}

=== STYLE ===
Ad type     : ${adType.toUpperCase()}
Aspect ratio: ${aspectRatio}
Brand colors: ${colors}
Fonts       : ${fonts}
CTA hints   : ${ctaHints}

=== AVAILABLE ASSETS ===
${assetSummary}

=== AD BLUEPRINT ===
${blueprintStr}

${feedbackSection}

=== RULES ===
1. Produce EXACTLY ${blueprint.length || 3} scenes, strictly following the blueprint order and scene roles.
2. Each scene's "assetRole" must match what the blueprint says it needs, if available. Fall back to "any" only if that category is unavailable.
3. Headlines: max 8 words. Subtext: max 12 words. Leave empty string "" if not needed.
4. Only the final CTA scene should have a non-empty "cta" button text.
5. Voiceover must fit the scene's durationSec at 2.5 words/sec max.
6. Never invent prices, stats, or guarantees not stated above.
7. Write only for THIS brand — no generic filler copy.
`.trim();
}

// ─── Node ─────────────────────────────────────────────────────────────────────

export async function draftNode(state) {
  const {
    scraped,
    stockImages = [],
    aspectRatio = '9:16',
    blueprint = [],
    feedback = [],
    script: previousScript = null,
    iterations = 0,
  } = state;

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[Scene Draft] OPENROUTER_API_KEY missing — returning null script.');
    return { script: null, error: 'OPENROUTER_API_KEY missing' };
  }

  if (!scraped) {
    console.warn('[Scene Draft] No scraped data — returning null script.');
    return { script: null, error: 'No scraped data' };
  }

  console.log(`[Scene Draft] ${blueprint.length} blueprint scenes, aspect: ${aspectRatio}`);

  const client = getOpenRouterClient();
  let script = null;
  let error = null;

  try {
    const prompt = buildPrompt(state, feedback, previousScript);
    const jsonSchema = zodToJsonSchema(ScriptSchema, 'Script');

    const systemPrompt = `
You are a Scene Draft node in an AI advertisement pipeline.
Produce a structured scene plan following the provided blueprint exactly.
Return only the JSON object — no markdown, no explanation.
`.trim();

    const apiResponse = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'Script',
          strict: true,
          schema: jsonSchema,
        },
      },
      reasoning: { enabled: true },
    });

    const content = apiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error('Model returned empty content.');

    console.log('[Scene Draft] Structured response received.');

    const rawJson = JSON.parse(content);
    const validated = ScriptSchema.parse(rawJson);

    script = {
      scenes: validated.scenes,
      format: toFormat(aspectRatio),
      adType: state.adType || 'business',
    };

    console.log(`[Scene Draft] ✓ ${script.scenes.length} scenes drafted.`);

  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.flatten().fieldErrors;
      error = 'Zod validation failed: ' + JSON.stringify(issues);
      console.error('[Scene Draft] Zod error:', JSON.stringify(issues, null, 2));
    } else {
      error = err?.message || 'Unknown Scene Draft error';
      console.error('[Scene Draft] Failed:', error);
    }
    script = null;
  }

  if (error) return { script: null, error };
  return { script, iterations };
}
