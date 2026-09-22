          //                ┌───────────────┐
          //                │     START     │
          //                └───────┬───────┘
          //                        │
          //                        ▼
          //     ┌─────────────────────────────────┐
          //     │  SCRAPE                         │
          //     │  Firecrawl                     │
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
          //     │  ROUTE IMAGES                  │
          //     │                                 │
          //     │  Are there 3+ good images?     │
          //     └───────────────┬─────────────────┘
          //                     │
          //           ┌─────────┴─────────┐
          //           │                   │
          //          YES                  NO
          //           │                   │
          //           │                   ▼
          //           │    ┌─────────────────────────┐
          //           │    │  PEXELS                 │
          //           │    │                         │
          //           │    │  Add stock photos       │
          //           │    └────────────┬────────────┘
          //           │                 │
          //           └────────┬────────┘
          //                    │
          //                    ▼
          //     ┌─────────────────────────────────┐
          //     │  DRAFT                          │
          //     │                                 │
          //     │  Gemini                         │
          //     │                                 │
          //     │  Generate 3-scene ad script     │
          //     └───────────────┬─────────────────┘
          //                     │
          //                     ▼
          //     ┌─────────────────────────────────┐
          //     │  REVIEW                         │
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
          //     │  RENDER                         │
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
          //     │  HUMAN REVIEW                   │
          //     │                                 │
          //     │  ⏸ INTERRUPT / PAUSE           │
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
          // │  APPLY EDITS        │       │
          // │                     │       │
          // │  Update scenes /    │       │
          // │  text / images      │       │
          // └──────────┬──────────┘       │
          //            │                  │
          //            └──────► RENDER ◄──┘
          //                               │
          //                               ▼
          //                ┌────────────────────────┐
          //                │       FINALIZE         │
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