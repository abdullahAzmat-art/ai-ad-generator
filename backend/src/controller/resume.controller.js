import { adGraph } from '../../ai/graph/index.js';
import { Command } from '@langchain/langgraph';

export async function resumeController(request, response) {
  const { thread_id, decision } = request.body ?? {};

  if (!thread_id || typeof thread_id !== 'string') {
    return response.status(400).json({ error: 'A valid thread_id is required.' });
  }

  if (!decision || typeof decision !== 'object') {
    return response.status(400).json({ error: 'A decision object is required.' });
  }

  const config = { configurable: { thread_id } };

  try {
    // Checkpoints live in process memory only, so a server restart (or a run
    // the user already approved) leaves nothing to resume.
    const pending = await adGraph.getState(config);
    if (!pending?.next?.length) {
      return response.status(410).json({
        error: 'This review session is no longer active. Generate the ad again to edit it.',
      });
    }

    const result = await adGraph.invoke(new Command({ resume: decision }), config);

    return response.json({
      success: !result.error,
      script: result.script,
      aspectRatio: result.aspectRatio,
      videoUrl: result.videoUrl,
      editWarnings: result.editWarnings ?? [],
      error: result.error ?? null,
    });
  } catch (error) {
    console.error('Resume workflow failed:', error);
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to apply the requested changes.',
    });
  }
}
