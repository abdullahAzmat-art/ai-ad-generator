/**
 * ============================================================
 *  AD GENERATOR: GRAPH BLUEPRINT      [x] built   [ ] todo
 * ============================================================
 *
 *  START
 *    |
 *    v
 *  [x] scrape ............ Firecrawl -> title, text, images, logo, color
 *    |
 *    v
 *  [x] route_images ...... 3+ good images?
 *    | yes ---------------------------+
 *    | no                             |
 *    v                                |
 *  [x] pexels ............ add stock photos
 *    |                                |
 *    +----------------+---------------+
 *                     v
 *  [x] draft ............. Gemini writes the 3-scene script
 *    |
 *    v
 *  [ ] review ............ rules + critic
 *    | issues (max 2 tries) --> back to draft
 *    | approved
 *    v
 *  [ ] render ............ JSON2Video
 *    | fails twice --> END (error)
 *    v
 *  [ ] human_review ...... PAUSE (interrupt): user approves or edits
 *    | edits --> apply_edits --> back to render
 *    | approve
 *    v
 *  [ ] finalize .......... save the final result
 *    |
 *    v
 *   END
 */

import { END, START, StateGraph } from '@langchain/langgraph';
import { AdState } from '../state/ad.state.js';
import { scrapeNode } from '../nodes/scrape.node.js';
import { pexelsNode } from '../nodes/pexels.node.js';
import { draftNode } from '../nodes/draft.node.js';
import { routeImages } from './routes.js';

export const adGraph = new StateGraph(AdState)
  .addNode('scrape', scrapeNode)
  .addNode('pexels', pexelsNode)
  .addNode('draft', draftNode)
  
  .addEdge(START, 'scrape')
  
  .addConditionalEdges('scrape', routeImages, {
    draft: 'draft',
    pexels: 'pexels',
  })
  
  .addEdge('pexels', 'draft')
  .addEdge('draft', END) // TEMP to allow graph to compile
  
  // .addNode('review', reviewNode)
  // .addNode('render', renderNode)
  // .addNode('human_review', humanReviewNode)
  // .addNode('apply_edits', applyEditsNode)
  // .addNode('finalize', finalizeNode)
  .compile();