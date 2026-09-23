import 'dotenv/config';
import { z } from 'zod';
import { getOpenRouterClient } from '../lib/openrouter.js';
import { zodToJsonSchema } from 'zod-to-json-schema';


// ─── Zod Schema ────────────────────────────────────────────────────────────────
// Flat schema requested from the AI
const FlatScriptSchema = z.object({
  scene1_headline: z.string().describe("Short hook headline (max 8 words)"),
  scene1_vo: z.string().describe("Voiceover script for scene 1"),
  scene2_headline: z.string().describe("Main feature/benefit headline (max 6 words)"),
  scene2_subtext: z.string().describe("Supporting proof/benefit sentence (max 10 words)"),
  scene2_vo: z.string().describe("Voiceover script for scene 2"),
  scene3_cta: z.string().describe("Clear call to action string (e.g. SHOP NOW - Win a Golden Card)"),
  scene3_vo: z.string().describe("Voiceover script for scene 3"),
});

// ─── Normalise raw model output ───────────────────────────────────────────────
// Transforms the flat JSON from the AI into the expected scenes array
function normalizeScript(raw) {
  return {
    scenes: [
      {
        id: 'scene-1',
        angle: 'Hook',
        headline: raw.scene1_headline || 'Welcome',
        body: '',
        cta: '',
        voiceover: raw.scene1_vo || '',
        imageIndex: 0,
        durationSec: 4
      },
      {
        id: 'scene-2',
        angle: 'Benefit',
        headline: raw.scene2_headline || 'Great Features',
        body: raw.scene2_subtext || '',
        cta: '',
        voiceover: raw.scene2_vo || '',
        imageIndex: 1,
        durationSec: 4
      },
      {
        id: 'scene-3',
        angle: 'CTA',
        headline: raw.scene3_cta || 'Shop Now',
        body: '',
        cta: 'SHOP NOW', // Fallback short button text
        voiceover: raw.scene3_vo || '',
        imageIndex: 2,
        durationSec: 4
      }
    ]
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormat(aspectRatio) {
  if (aspectRatio === '16:9') return 'banner';
  if (aspectRatio === '1:1') return 'square';
  return 'story';
}

function buildPrompt(
  scraped,
  allImages,
  aspectRatio,
  feedback,
  previousScript
) {
  const {
    title = '',
    description = '',
    pageText = '',
    brandColor = '#10B981',
  } = scraped;

  const imageList = allImages.length
    ? allImages.map((u, i) => `${i}. ${u}`).join('\n')
    : '(no images available — use imageIndex: 0)';

  let feedbackSection = '';

  if (feedback && feedback.length > 0) {
    feedbackSection = `
=== FEEDBACK FROM PREVIOUS ATTEMPT ===
Your previous attempt had these problems, fix ALL of them:
${feedback.join('\n')}

Previous script:
${JSON.stringify(previousScript, null, 2)}
`;
  }

  return `
You are a world-class performance-marketing copywriter.

Create EXACTLY 3 ad scenes for this brand.

=== BRAND DATA ===
Title       : ${title}
Description : ${description}
Page text   : ${pageText.slice(0, 2000)}
Brand color : ${brandColor}
Aspect ratio: ${aspectRatio}

=== AVAILABLE IMAGES ===
${imageList}

${feedbackSection}

=== OUTPUT FORMAT ===
Return a single JSON object with exactly these 7 keys. No extra keys, no markdown, no explanation:

{
  "scene1_headline": "<short hook headline — max 8 words>",
  "scene1_vo": "<voiceover for scene 1 — fits 4 seconds @ 2.5 words/sec max>",
  "scene2_headline": "<main feature/benefit headline — max 6 words>",
  "scene2_subtext": "<supporting proof or benefit — max 10 words>",
  "scene2_vo": "<voiceover for scene 2 — fits 4 seconds @ 2.5 words/sec max>",
  "scene3_cta": "<clear call-to-action string, e.g. SHOP NOW - Free Shipping Today>",
  "scene3_vo": "<voiceover for scene 3 — fits 4 seconds @ 2.5 words/sec max>"
}

=== RULES ===
1. scene1_headline is the hook — grab attention with the brand's strongest claim or curiosity trigger.
2. scene2_headline is the benefit — the clearest reason to buy (max 6 words).
3. scene2_subtext backs it up with a concrete proof point. Use only facts from the brand data above.
4. scene3_cta is the button text. Make it action-oriented and urgent.
5. All voiceovers must be natural speech that fits exactly 4 seconds (max 10 words each).
6. Write only for THIS brand. Never use generic copy ("Buy Now", "Great Product", etc.).
7. Never invent prices, discounts, statistics, guarantees, or claims not stated in the brand data.
`.trim();
}

// ─── Node ─────────────────────────────────────────────────────────────────────

export async function draftNode(state) {
  const {
    scraped,
    stockImages = [],
    aspectRatio = '9:16',
    feedback = [],
    script: previousScript = null,
    iterations = 0,
  } = state;

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn(
      '[Draft Node] OPENROUTER_API_KEY missing — returning null script.'
    );

    return {
      script: null,
      error: 'OPENROUTER_API_KEY missing',
    };
  }

  if (!scraped) {
    console.warn(
      '[Draft Node] No scraped data — returning null script.'
    );

    return {
      script: null,
      error: 'No scraped data',
    };
  }

  // ── Combine and deduplicate images ────────────────────────────────────────

  const allImages = [
    ...new Set([
      ...(scraped.images ?? []),
      ...stockImages,
    ]),
  ];

  console.log(
    `[Draft Node] ${allImages.length} images, aspect: ${aspectRatio}`
  );

  const client = getOpenRouterClient();

  let script = null;
  let error = null;

  try {
    // ── Build prompt ────────────────────────────────────────────────────────

    const prompt = buildPrompt(
      scraped,
      allImages,
      aspectRatio,
      feedback,
      previousScript
    );

    // ── Convert Zod → JSON Schema ───────────────────────────────────────────

    const jsonSchema = zodToJsonSchema(
      FlatScriptSchema,
      'Script'
    );

    // ── System prompt ──────────────────────────────────────────────────────
    const systemPrompt = `
Create the advertisement script according to the required structured output schema.

Important:
- Return exactly a single JSON object.
- Every required field must be present.
- Return only the structured output.
`.trim();

    // ── OpenRouter request ─────────────────────────────────────────────────

    const apiResponse = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',

      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],

      temperature: 0.3,

      // IMPORTANT:
      // We are using JSON Schema instead of simple JSON mode.
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'Script',
          strict: true,
          schema: jsonSchema,
        },
      },

      // Reasoning is not necessary for this relatively simple
      // structured generation task.
      reasoning: {
        enabled: true,
      },
    });

    // ── Get model response ─────────────────────────────────────────────────

    const content = apiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Model returned empty content.');
    }

    console.log('[Draft Node] Raw structured response received.');

    // ── Parse JSON ──────────────────────────────────────────────────────────

    const rawJson = JSON.parse(content);

    // ── Validate with Zod ───────────────────────────────────────────────────

    const validatedFlat = FlatScriptSchema.parse(rawJson);

    // ── Normalise into expected scenes array ────────────────────────────────

    const result = normalizeScript(validatedFlat);
    console.log('[Draft Node] Normalised scenes:', result.scenes.length);

    // ── Clamp image indexes to valid range ──────────────────────────────────

    const maxImageIndex = Math.max(allImages.length - 1, 0);

    for (const scene of result.scenes) {
      if (scene.imageIndex > maxImageIndex) {
        scene.imageIndex = maxImageIndex;
      }
    }

    // ── Final script ───────────────────────────────────────────────────────

    script = {
      ...result,
      format: toFormat(aspectRatio),
    };

    console.log(
      `[Draft Node] ✓ ${script.scenes.length} scenes drafted successfully.`
    );

  } catch (err) {

    // ── Zod error ──────────────────────────────────────────────────────────

    if (err instanceof z.ZodError) {
      const issues = err.flatten().fieldErrors;

      error =
        'Zod validation failed: ' +
        JSON.stringify(issues);

      console.error(
        '[Draft Node] Zod validation failed:',
        JSON.stringify(issues, null, 2)
      );

    } else {

      // ── API / JSON / other error ─────────────────────────────────────────

      error = err?.message || 'Unknown Draft Node error';

      console.error(
        '[Draft Node] Failed:',
        error
      );
    }

    script = null;
  }

  // ── Return failure ───────────────────────────────────────────────────────

  if (error) {
    return {
      script: null,
      error,
    };
  }

  // ── Return successful script ─────────────────────────────────────────────

  return {
    script,
    iterations,
  };
}

