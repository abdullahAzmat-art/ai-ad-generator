import { mergeSceneEdits, cleanAspectRatio } from '../lib/sceneEdits.js';
import { toFormat } from '../lib/canvas.js';

export async function applyEditsNode(state) {
  const { script, decision, editCount = 0 } = state;

  const { scenes, warnings, error } = mergeSceneEdits(script?.scenes, decision?.edits?.scenes);

  if (error) {
    console.error('[Apply Edits Node] Rejected:', error);
    return { error, editWarnings: [], editCount };
  }

  // The editor may also send a new frame size; renderNode reads it from state.
  const aspectRatio = cleanAspectRatio(decision?.aspectRatio, state.aspectRatio);
  if (aspectRatio !== state.aspectRatio) {
    warnings.push(`Re-rendering the ad at ${aspectRatio}.`);
  }

  warnings.forEach((warning) => console.warn('[Apply Edits Node]', warning));
  console.log(`[Apply Edits Node] Applied copy edits to ${scenes.length} scenes.`);

  return {
    aspectRatio,
    script: { ...script, scenes, format: toFormat(aspectRatio) },
    editWarnings: warnings,
    error: null,
    editCount: editCount + 1,
  };
}
