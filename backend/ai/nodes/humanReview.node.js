import { interrupt } from '@langchain/langgraph';

export async function humanReviewNode(state) {
  console.log('[Human Review Node] Pausing for frontend review...');

  // Use LangGraph's native interrupt to send a message to the frontend and pause execution
  const userDecision = interrupt({
    type: 'reviewads', // The frontend can listen for this payload
    message: 'Please review the generated video ad.',
    videoUrl: state.videoUrl,
  });

  // When execution is resumed, userDecision will contain the payload sent from the frontend
  console.log('[Human Review Node] Resumed with decision:', userDecision);

  return { decision: userDecision };
}
