export async function applyEditsNode(state) {
  console.log('[Apply Edits Node] Applying user edits to the script...');

  const { decision, script } = state;

  if (decision && decision.edits) {
    // Merge edits into the current script
    // This assumes decision.edits is the modified script object or contains changes
    const updatedScript = { ...script, ...decision.edits };
    return { script: updatedScript, editCount: (state.editCount || 0) + 1 };
  }

  return {};
}
