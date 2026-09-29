// Scene copy the editor may change, and the hard ceilings the render engine
// can actually lay out. The UI warns before these are reached; this module is
// the last line of defence, because the editor's payload is user input.
import { DEFAULT_ASPECT_RATIO, isSupportedAspectRatio } from './canvas.js';

const EDITABLE_FIELDS = {
  headline: 90,
  subtext: 150,
  voiceover: 320,
  cta: 30,
};

// Everything else on a scene — layout, animation, assetRole, durationSec — is
// chosen by the pipeline and deliberately NOT read from the payload, so a
// hand-crafted request can never reshape the video or aim the renderer at an
// arbitrary image. The frame size IS read, but only as one of the ratios the
// renderer has a canvas for.

/**
 * The frame the editor asked to re-render into, or the ratio it already had.
 *
 * @param {unknown} value aspect ratio from the resume payload, e.g. "16:9"
 * @param {string} fallback ratio currently held in graph state
 */
export function cleanAspectRatio(value, fallback = DEFAULT_ASPECT_RATIO) {
  return isSupportedAspectRatio(value) ? value : fallback;
}
function cleanText(value, maxChars) {
  const text = (typeof value === 'string' ? value : '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { text: text.slice(0, maxChars), truncated: text.length > maxChars };
}

/**
 * Merge the copy edited in the browser onto the scenes the pipeline produced.
 *
 * @param {Array|null|undefined} currentScenes scenes from the rendered script
 * @param {unknown} incomingScenes one entry per scene, text fields optional
 * @returns {{ scenes?: Array, warnings: string[], error?: string }}
 */
export function mergeSceneEdits(currentScenes, incomingScenes) {
  const warnings = [];

  if (!Array.isArray(currentScenes) || currentScenes.length === 0) {
    return { warnings, error: 'No scenes to edit. Generate the ad again.' };
  }

  if (!Array.isArray(incomingScenes)) {
    return { warnings, error: 'Edited scenes are missing from the request.' };
  }

  if (incomingScenes.length !== currentScenes.length) {
    return {
      warnings,
      error: `Received ${incomingScenes.length} edited scenes but the ad has ${currentScenes.length}. Reload the page and try again.`,
    };
  }

  const malformed = incomingScenes.findIndex((s) => !s || typeof s !== 'object');
  if (malformed !== -1) {
    return { warnings, error: `Scene ${malformed + 1} is malformed. Reload the page and try again.` };
  }

  const scenes = currentScenes.map((scene, index) => {
    const incoming = incomingScenes[index];
    const merged = { ...scene };

    for (const [field, maxChars] of Object.entries(EDITABLE_FIELDS)) {
      if (!(field in incoming)) continue;
      const { text, truncated } = cleanText(incoming[field], maxChars);
      merged[field] = text;
      if (truncated) {
        warnings.push(`Scene ${index + 1}: ${field} shortened to fit the frame (${maxChars} characters).`);
      }
    }

    if (!merged.headline) {
      warnings.push(`Scene ${index + 1}: headline is empty, so only its visual and voiceover render.`);
    }

    const isFinalScene = index === currentScenes.length - 1;
    if (!isFinalScene && merged.cta) {
      merged.cta = '';
      warnings.push(`Scene ${index + 1}: its button was cleared — only the closing scene shows one.`);
    }
    if (isFinalScene && !merged.cta) {
      warnings.push('Closing scene: its button fell back to the default call to action.');
    }

    return merged;
  });

  return { scenes, warnings };
}
