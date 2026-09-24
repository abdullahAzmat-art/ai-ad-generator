const VALID_LAYOUTS = new Set([
  'full-bleed', 'product-center', 'product-right',
  'product-left', 'top-text', 'bottom-text', 'split', 'overlay',
]);

const VALID_ANIMATIONS = new Set([
  'slow-zoom', 'fade-in', 'slide-up', 'product-reveal',
  'slide-right', 'pulse', 'none',
]);

const VALID_ASSET_ROLES = new Set([
  'productHero', 'productSecondary', 'lifestyle',
  'person', 'office', 'food', 'background', 'logo', 'any',
]);

export async function reviewNode(state) {
  const { script, blueprint = [], iterations = 0 } = state;
  const feedback = [];
  let approved = false;

  // 1. Missing script
  if (!script || !Array.isArray(script.scenes)) {
    return {
      feedback: ['Script generation failed. Please regenerate strictly following the JSON schema.'],
      approved: false,
      iterations: iterations + 1,
    };
  }

  const expectedCount = blueprint.length || 3;

  // 2. Scene count must match the blueprint
  if (script.scenes.length !== expectedCount) {
    feedback.push(
      `Expected exactly ${expectedCount} scenes (matching the blueprint), got ${script.scenes.length}.`
    );
  }

  // 3. Per-scene validation
  script.scenes.forEach((scene, i) => {
    const n = i + 1;
    const blueprintStep = blueprint[i];

    // 3a. Role must match blueprint
    if (blueprintStep && scene.role !== blueprintStep.role) {
      feedback.push(
        `Scene ${n}: role is "${scene.role}" but blueprint expects "${blueprintStep.role}".`
      );
    }

    // 3b. Layout must be a known semantic name
    if (!VALID_LAYOUTS.has(scene.layout)) {
      feedback.push(
        `Scene ${n}: unknown layout "${scene.layout}". Must be one of: ${[...VALID_LAYOUTS].join(', ')}.`
      );
    }

    // 3c. Animation must be a known semantic name
    if (!VALID_ANIMATIONS.has(scene.animation)) {
      feedback.push(
        `Scene ${n}: unknown animation "${scene.animation}". Must be one of: ${[...VALID_ANIMATIONS].join(', ')}.`
      );
    }

    // 3d. Asset role must be valid
    if (!VALID_ASSET_ROLES.has(scene.assetRole)) {
      feedback.push(
        `Scene ${n}: unknown assetRole "${scene.assetRole}". Must be one of: ${[...VALID_ASSET_ROLES].join(', ')}.`
      );
    }

    // 3e. Headline required, max 8 words
    if (!scene.headline || scene.headline.trim() === '') {
      feedback.push(`Scene ${n}: headline is required.`);
    } else {
      const wordCount = scene.headline.trim().split(/\s+/).length;
      if (wordCount > 8) {
        feedback.push(`Scene ${n}: headline too long (${wordCount} words). Max 8 words.`);
      }
    }

    // 3f. Subtext max 12 words (if provided)
    if (scene.subtext && scene.subtext.trim() !== '') {
      const wordCount = scene.subtext.trim().split(/\s+/).length;
      if (wordCount > 12) {
        feedback.push(`Scene ${n}: subtext too long (${wordCount} words). Max 12 words.`);
      }
    }

    // 3g. Voiceover word-count vs duration
    const voiceWordCount = (scene.voiceover || '').trim().split(/\s+/).filter(Boolean).length;
    const maxVoiceWords = Math.floor((scene.durationSec || 4) * 2.5);
    if (voiceWordCount > maxVoiceWords) {
      feedback.push(
        `Scene ${n}: voiceover too long (${voiceWordCount} words). Max for ${scene.durationSec}s is ${maxVoiceWords} words.`
      );
    }

    // 3h. Duration bounds
    if (scene.durationSec < 2 || scene.durationSec > 6) {
      feedback.push(`Scene ${n}: durationSec must be between 2 and 6. Got ${scene.durationSec}.`);
    }

    // 3i. CTA should only appear on the final scene
    if (i < script.scenes.length - 1 && scene.cta && scene.cta.trim() !== '') {
      feedback.push(`Scene ${n}: only the last scene should have a CTA button.`);
    }
    if (i === script.scenes.length - 1 && (!scene.cta || scene.cta.trim() === '')) {
      feedback.push(`Scene ${n} (final): missing CTA button text.`);
    }
  });

  // 4. Total duration check
  const totalDuration = script.scenes.reduce((sum, s) => sum + (s.durationSec || 0), 0);
  if (totalDuration < 8 || totalDuration > 20) {
    feedback.push(`Total duration must be 8–20s. Currently ${totalDuration}s.`);
  }

  approved = feedback.length === 0;

  console.log(
    `[Review Node] Approved: ${approved}, Issues: ${feedback.length}, Iteration: ${iterations + 1}`
  );

  return { feedback, approved, iterations: iterations + 1 };
}
