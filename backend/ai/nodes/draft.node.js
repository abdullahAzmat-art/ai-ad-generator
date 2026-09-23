import 'dotenv/config';
import { z } from 'zod';
import { getOpenRouterClient } from '../lib/openrouter.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const hex = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'must be a hex color');

const SceneSchema = z.object({
  id         : z.enum(['scene-1', 'scene-2', 'scene-3']),
  angle      : z.string().min(1),
  headline   : z.string().min(1),
  body       : z.string().min(1),
  cta        : z.string().min(1).default('Learn More'),
  imageIndex : z.number().int().min(0).default(0),
  durationSec: z.number().min(2).max(8).default(4),
  voiceover  : z.string().min(1),
  bgFrom     : hex.default('#0a1945'),
  bgTo       : hex.default('#040a1d'),
  textColor  : hex.default('#ffffff'),
  ctaBg      : hex.default('#10B981'),
  ctaText    : hex.default('#ffffff'),
});

const ScriptSchema = z.object({
  brandColor: hex.default('#10B981'),
  scenes    : z.array(SceneSchema).length(3),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormat(aspectRatio) {
  if (aspectRatio === '16:9') return 'banner';
  if (aspectRatio === '1:1')  return 'square';
  return 'story';
}

function buildPrompt(scraped, allImages, aspectRatio, feedback, previousScript) {
  const { title = '', description = '', pageText = '', brandColor = '#10B981' } = scraped;
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
Write EXACTLY 3 ad scenes for this brand. Use the structured output format.

=== BRAND DATA ===
Title       : ${title}
Description : ${description}
Page text   : ${pageText.slice(0, 2000)}
Brand color : ${brandColor}
Aspect ratio: ${aspectRatio}

=== AVAILABLE IMAGES (pick a different imageIndex for each scene) ===
${imageList}
${feedbackSection}
=== RULES ===
1. Each scene must have a DIFFERENT angle (Hook / Social Proof / Urgency / Pain Point / Feature Focus / Direct Response).
2. Headlines must be SPECIFIC to this brand — never generic.
3. Derive bgFrom/bgTo gradients from the brand color (${brandColor}).
4. Ensure readable contrast between textColor and the gradient.
5. Only use facts from the brand data above. Never invent prices, discounts, or claims not stated in the page text.
6. voiceover must fit durationSec at ~2.5 words per second max.
7. Total duration across all 3 scenes must be 12-18 seconds.
8. imageIndex must be a number from the list above, not a URL.
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
    iterations = 0
  } = state;

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[Draft Node] OPENROUTER_API_KEY missing — returning null script.');
    return { script: null, error: 'OPENROUTER_API_KEY missing' };
  }

  if (!scraped) {
    console.warn('[Draft Node] No scraped data — returning null script.');
    return { script: null, error: 'No scraped data' };
  }

  // Deduplicate scraped + stock images
  const allImages = [...new Set([...(scraped.images ?? []), ...stockImages])];
  console.log(`[Draft Node] ${allImages.length} images, aspect: ${aspectRatio}`);

  const client = getOpenRouterClient();

  let script = null;
  let error = null;

  try {
    const prompt = buildPrompt(scraped, allImages, aspectRatio, feedback, previousScript);
    const jsonSchema = zodToJsonSchema(ScriptSchema, "Script");

    const systemPrompt = `You must output ONLY valid JSON matching this schema:
${JSON.stringify(jsonSchema, null, 2)}`;

    const apiResponse = await client.chat.completions.create({
      model: 'qwen/qwen3.8-27b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      reasoning: { enabled: true }
    });

    // Extract content
    const content = apiResponse.choices[0].message.content;
    
    // Clean markdown code blocks if the model wrapped it
    const jsonStr = (content || "{}").replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    const parsed = JSON.parse(jsonStr);
    const result = ScriptSchema.parse(parsed);

    // Backfill brand color into scene ctaBg if Gemini left it as the placeholder
    if (result.brandColor === '#10B981' && scraped.brandColor) {
      result.brandColor = scraped.brandColor;
    }
    for (const scene of result.scenes) {
      if (scene.ctaBg === '#10B981') scene.ctaBg = result.brandColor;
    }

    script = { ...result, format: toFormat(aspectRatio) };
    console.log(`[Draft Node] ✓ ${script.scenes.length} scenes — brand: ${script.brandColor}`);

  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.flatten().fieldErrors;
      error = 'Zod validation failed: ' + JSON.stringify(issues);
      console.error('[Draft Node] Zod validation failed:', JSON.stringify(issues, null, 2));
    } else {
      error = err.message;
      console.error('[Draft Node] Failed:', err.message);
    }
    script = null;
  }

  if (error) {
    return { script: null, error };
  }

  return { script, iterations };
}
