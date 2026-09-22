import 'dotenv/config';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const hex = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'must be a hex color');

const SceneSchema = z.object({
  id       : z.enum(['scene-1', 'scene-2', 'scene-3']),
  angle    : z.string().min(1),
  headline : z.string().min(1),   // required — no default
  body     : z.string().min(1),   // required — no default
  cta      : z.string().min(1).default('Learn More'),
  imageUrl : z.string().default(''),
  bgFrom   : hex.default('#0a1945'),
  bgTo     : hex.default('#040a1d'),
  textColor: hex.default('#ffffff'),
  ctaBg    : hex.default('#10B981'),
  ctaText  : hex.default('#ffffff'),
});

const ScriptSchema = z.object({
  brandColor: hex.default('#10B981'),
  scenes    : z.array(SceneSchema).length(3),  // exactly 3, hard error if not
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormat(aspectRatio) {
  if (aspectRatio === '16:9') return 'banner';
  if (aspectRatio === '1:1')  return 'square';
  return 'story';
}

function buildPrompt(scraped, allImages, aspectRatio) {
  const { title = '', description = '', pageText = '', brandColor = '#10B981' } = scraped;
  const imageList = allImages.length
    ? allImages.map((u, i) => `${i + 1}. ${u}`).join('\n')
    : '(no images available — use imageUrl: "")';

  return `
You are a world-class performance-marketing copywriter.
Write EXACTLY 3 ad scenes for this brand. Use the structured output format.

=== BRAND DATA ===
Title       : ${title}
Description : ${description}
Page text   : ${pageText.slice(0, 2000)}
Brand color : ${brandColor}
Aspect ratio: ${aspectRatio}

=== AVAILABLE IMAGES (pick a different URL for each scene) ===
${imageList}

=== RULES ===
1. Each scene must have a DIFFERENT angle (Hook / Social Proof / Urgency / Pain Point / Feature Focus / Direct Response).
2. Headlines must be SPECIFIC to this brand — never generic.
3. Derive bgFrom/bgTo gradients from the brand color (${brandColor}).
4. Ensure readable contrast between textColor and the gradient.
`.trim();
}

// ─── Node ─────────────────────────────────────────────────────────────────────

export async function draftNode(state) {
  const { scraped, stockImages = [], aspectRatio = '9:16' } = state;

  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Draft Node] GEMINI_API_KEY missing — returning null script.');
    return { script: null };
  }

  if (!scraped) {
    console.warn('[Draft Node] No scraped data — returning null script.');
    return { script: null };
  }

  // Deduplicate scraped + stock images
  const allImages = [...new Set([...(scraped.images ?? []), ...stockImages])];
  console.log(`[Draft Node] ${allImages.length} images, aspect: ${aspectRatio}`);

  // ── LangChain: model with structured output bound to Zod schema ──
  const model = new ChatGoogleGenerativeAI({
    model      : 'gemini-2.5-flash',
    apiKey     : process.env.GEMINI_API_KEY,
    temperature: 0.7,
  }).withStructuredOutput(ScriptSchema, { name: 'script' });

  let script = null;

  try {
    const prompt = buildPrompt(scraped, allImages, aspectRatio);

    // LangChain handles the API call, JSON extraction, and Zod parsing
    const result = await model.invoke([new HumanMessage(prompt)]);

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
      console.error('[Draft Node] Zod validation failed:',
        JSON.stringify(err.flatten().fieldErrors, null, 2));
    } else {
      console.error('[Draft Node] Failed:', err.message);
    }
    script = null;
  }

  return { script };
}
