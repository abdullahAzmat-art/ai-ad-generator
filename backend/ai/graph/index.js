//                ┌───────────────┐
//                │     START     │
//                └───────┬───────┘
//                        │
//                        ▼
//     ┌─────────────────────────────────┐
//     │ [x] SCRAPE                      │
//     │  Firecrawl                      │
//     │                                 │
//     │  • title                        │
//     │  • text                         │
//     │  • images                       │
//     │  • logo                         │
//     │  • colors                       │
//     └───────────────┬─────────────────┘
//                     │
//                     ▼
//     ┌─────────────────────────────────┐
//     │ [x] ROUTE IMAGES                │
//     │                                 │
//     │  Are there 3+ good images?      │
//     └───────────────┬─────────────────┘
//                     │
//           ┌─────────┴─────────┐
//           │                   │
//          YES                  NO
//           │                   │
//           │                   ▼
//           │    ┌─────────────────────────┐
//           │    │ [x] PEXELS              │
//           │    │                         │
//           │    │  Add stock photos       │
//           │    └────────────┬────────────┘
//           │                 │
//           └────────┬────────┘
//                    │
//                    ▼
//     ┌─────────────────────────────────┐
//     │ [x] DRAFT                       │
//     │                                 │
//     │  Gemini                         │
//     │                                 │
//     │  Generate 3-scene ad script     │
//     └───────────────┬─────────────────┘
//                     │
//                     ▼
//     ┌─────────────────────────────────┐
//     │ [x] REVIEW                      │
//     │                                 │
//     │  • Rules check                  │
//     │  • Critic                       │
//     │  • Quality validation           │
//     └───────────────┬─────────────────┘
//                     │
//           ┌─────────┴──────────┐
//           │                    │
//        ISSUES                APPROVED
//           │                    │
//           ▼                    │
//    ┌──────────────┐            │
//    │ Retry count  │            │
//    │   < 2 ?      │            │
//    └──────┬───────┘            │
//           │                    │
//      YES  │  NO                │
//           │   │                │
//           │   ▼                │
//           │  ┌──────────────┐  │
//           │  │     END      │  │
//           │  │    ERROR     │  │
//           │  └──────────────┘  │
//           │                    │
//           └──────► DRAFT ◄─────┘
//                                │
//                                ▼
//     ┌─────────────────────────────────┐
//     │ [x] RENDER                      │
//     │                                 │
//     │  JSON2Video                     │
//     │                                 │
//     │  Generate video                 │
//     └───────────────┬─────────────────┘
//                     │
//                ┌────┴────┐
//                │         │
//              SUCCESS    FAIL
//                │         │
//                │         ▼
//                │   ┌──────────────┐
//                │   │ Retry count  │
//                │   │   < 2 ?      │
//                │   └──────┬───────┘
//                │          │
//                │     YES  │  NO
//                │          │   │
//                │          │   ▼
//                │          │ ┌──────────────┐
//                │          │ │     END      │
//                │          │ │    ERROR     │
//                │          │ └──────────────┘
//                │          │
//                │          └──► RENDER
//                │
//                ▼
//     ┌─────────────────────────────────┐
//     │ [ ] HUMAN REVIEW                │
//     │                                 │
//     │  ⏸ INTERRUPT / PAUSE            │
//     │                                 │
//     │  User reviews generated ad      │
//     └───────────────┬─────────────────┘
//                     │
//           ┌─────────┴─────────┐
//           │                   │
//         EDIT                 APPROVE
//           │                   │
//           ▼                   │
// ┌─────────────────────┐       │
// │ [ ] APPLY EDITS     │       │
// │                     │       │
// │  Update scenes /    │       │
// │  text / images      │       │
// └──────────┬──────────┘       │
//            │                  │
//            └──────► RENDER ◄──┘
//                               │
//                               ▼
//                ┌────────────────────────┐
//                │ [ ] FINALIZE           │
//                │                        │
//                │  Save final result     │
//                │  • video URL           │
//                │  • scenes              │
//                │  • metadata            │
//                └────────────┬───────────┘
//                             │
//                             ▼
//                     ┌───────────────┐
//                     │      END      │
//                     └───────────────┘
import { END, START, StateGraph, MemorySaver } from '@langchain/langgraph';
import { AdState } from '../state/ad.state.js';
import { scrapeNode } from '../nodes/scrape.node.js';
import { pexelsNode } from '../nodes/pexels.node.js';
import { draftNode } from '../nodes/draft.node.js';
import { reviewNode } from '../nodes/review.node.js';
import { renderNode } from '../nodes/render.node.js';
import { humanReviewNode } from '../nodes/humanReview.node.js';
import { applyEditsNode } from '../nodes/applyEdits.node.js';
import { finalizeNode } from '../nodes/finalize.node.js';
import { routeImages, routeReview, routeHumanReview } from './routes.js';

export const adGraph = new StateGraph(AdState)
  .addNode('scrape', scrapeNode)
  .addNode('pexels', pexelsNode)
  .addNode('draft', draftNode)
  .addNode('review', reviewNode)
  .addNode('render', renderNode)
  .addNode('human_review', humanReviewNode)
  .addNode('apply_edits', applyEditsNode)
  .addNode('finalize', finalizeNode)
  
  .addEdge(START, 'scrape')
  
  .addConditionalEdges('scrape', routeImages, {
    draft: 'draft',
    pexels: 'pexels',
  })
  
  .addEdge('pexels', 'draft')
  .addEdge('draft', 'review')
  
  .addConditionalEdges('review', routeReview, {
    draft: 'draft',
    render: 'render', // We proceed to render
  })
  
  // After render, go to human review
  .addEdge('render', 'human_review')
  
  .addConditionalEdges('human_review', routeHumanReview, {
    apply_edits: 'apply_edits',
    finalize: 'finalize',
  })
  
  .addEdge('apply_edits', 'render')
  .addEdge('finalize', END)
  
  .compile({ checkpointer: new MemorySaver() });