import { mergeSceneEdits } from '../lib/sceneEdits.js';

export async function applyEditsNode(state) {
  const { script, decision, editCount = 0 } = state;

  const { scenes, warnings, error } = mergeSceneEdits(script?.scenes, decision?.edits?.scenes);

  if (error) {
    console.error('[Apply Edits Node] Rejected:', error);
    return { error, editWarnings: [], editCount };
  }

  warnings.forEach((warning) => console.warn('[Apply Edits Node]', warning));
  console.log(`[Apply Edits Node] Applied copy edits to ${scenes.length} scenes.`);

  return {
    script: { ...script, scenes },
    editWarnings: warnings,
    error: null,
    editCount: editCount + 1,
  };
}
