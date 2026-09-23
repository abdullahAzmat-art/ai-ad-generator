import { adGraph } from '../../ai/graph/index.js';
import { Command } from '@langchain/langgraph';

export async function resumeController(request, response) {
  const { thread_id, decision } = request.body ?? {};

  if (!thread_id || !decision) {
    return response.status(400).json({ error: 'thread_id and decision are required.' });
  }

  try {
    // Resume the graph from the interrupt by sending a Command
    const result = await adGraph.invoke(
      new Command({ resume: decision }),
      { configurable: { thread_id } }
    );
    
    return response.json({
      success: true,
      script: result.script,
      videoUrl: result.videoUrl,
      state: result
    });
  } catch (error) {
    console.error('Resume workflow failed:', error);
    return response.status(500).json({ error: error.message });
  }
}
