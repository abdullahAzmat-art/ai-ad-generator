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
import { END, START, StateGraph } from '@langchain/langgraph';
import { AdState } from '../state/ad.state.js';
import { scrapeNode } from '../nodes/scrape.node.js';
import { pexelsNode } from '../nodes/pexels.node.js';
import { draftNode } from '../nodes/draft.node.js';
import { reviewNode } from '../nodes/review.node.js';
import { renderNode } from '../nodes/render.node.js';
import { routeImages, routeReview } from './routes.js';

export const adGraph = new StateGraph(AdState)
  .addNode('scrape', scrapeNode)
  .addNode('pexels', pexelsNode)
  .addNode('draft', draftNode)
  .addNode('review', reviewNode)
  .addNode('render', renderNode)
  
  .addEdge(START, 'scrape')
  
  .addConditionalEdges('scrape', routeImages, {
    draft: 'draft',
    pexels: 'pexels',
  })
  
  .addEdge('pexels', 'draft')
  .addEdge('draft', 'review')
  
  .addConditionalEdges('review', routeReview, {
    draft: 'draft',
    render: 'render',
  })
  
  .addEdge('render', END) // Temporarily pointing to END until Human Review is built
  
  // .addNode('human_review', humanReviewNode)
  // .addNode('apply_edits', applyEditsNode)
  // .addNode('finalize', finalizeNode)
  .compile();