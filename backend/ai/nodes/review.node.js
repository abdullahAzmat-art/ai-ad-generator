export async function reviewNode(state) {
  const { script, scraped, stockImages = [], iterations = 0 } = state;
  const feedback = [];
  let approved = false;

  // 1. If script is completely missing (e.g., Zod or Gemini failed upstream)
  if (!script) {
    return {
      feedback: ['Script generation failed. Please try again and strictly follow the JSON schema.'],
      approved: false,
      iterations: iterations + 1,
    };
  }

  // Gather images to check bounds
  const scraperImages = scraped?.images ?? [];
  const allImages = [...new Set([...scraperImages, ...stockImages])];
  const maxImageIndex = Math.max(0, allImages.length - 1);

  // 2. Scene count / roles
  if (!script.scenes || script.scenes.length !== 3) {
    feedback.push(`Expected exactly 3 scenes, got ${script.scenes?.length ?? 0}.`);
  }

  if (script.scenes && script.scenes.length === 3) {
    // 3. Total duration
    const totalDuration = script.scenes.reduce((sum, s) => sum + (s.durationSec || 0), 0);
    if (totalDuration < 12 || totalDuration > 18) {
      feedback.push(`Total duration must be 12–18s. Currently it is ${totalDuration}s.`);
    }

    // Scene-level checks
    script.scenes.forEach((scene, i) => {
      const n = i + 1;

      // 4. Voiceover length (words <= durationSec * 2.5)
      const wordCount = (scene.voiceover || '').trim().split(/\s+/).length;
      const maxWords = Math.floor((scene.durationSec || 4) * 2.5);
      if (wordCount > maxWords) {
        feedback.push(`Scene ${n} voiceover is too long (${wordCount} words). Max for ${scene.durationSec}s is ${maxWords} words.`);
      }

      // 5. Image index bounds
      const idx = scene.imageIndex;
      if (typeof idx !== 'number' || idx < 0 || idx > maxImageIndex) {
        if (allImages.length === 0) {
          if (idx !== 0) feedback.push(`Scene ${n} imageIndex must be 0 (no images available).`);
        } else {
          feedback.push(`Scene ${n} imageIndex (${idx}) is out of bounds. Must be 0 to ${maxImageIndex}.`);
        }
      }

      // 6. Headline length (< 45 chars)
      const hl = scene.headline || '';
      if (hl.length >= 45) {
        feedback.push(`Scene ${n} headline is too long (${hl.length} chars). Must be under 45 chars.`);
      }
    });
  }

  if (feedback.length === 0) {
    approved = true;
  }

  console.log(`[Review Node] Approved: ${approved}, Feedback: ${feedback.length} issues, Iteration: ${iterations + 1}`);

  return {
    feedback,
    approved,
    iterations: iterations + 1,
  };
}
