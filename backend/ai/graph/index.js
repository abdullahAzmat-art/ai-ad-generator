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
//     │ [x] CLASSIFY ASSETS             │
//     │  Categorize images via vision   │
//     └───────────────┬─────────────────┘
//                     │
//                     ▼
//     ┌─────────────────────────────────┐
//     │ [x] DETECT AD TYPE              │
//     │  Product / Service / Business   │
//     └───────────────┬─────────────────┘
//                     │
//                     ▼
//     ┌─────────────────────────────────┐
//     │ [x] BLUEPRINT                   │
//     │  Plan structure & find gaps     │
//     └───────────────┬─────────────────┘
//                     │
//                     ▼
//     ┌─────────────────────────────────┐
//     │ [x] ROUTE IMAGES                │
//     │                                 │
//     │  Are there missing assets?      │
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
//           │    │  Fill missing gaps      │
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
import { classifyAssetsNode } from '../nodes/classifyAssets.node.js';
import { detectAdTypeNode } from '../nodes/detectAdType.node.js';
import { blueprintNode } from '../nodes/blueprint.node.js';
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
  .addNode('classify_assets', classifyAssetsNode)
  .addNode('detect_ad_type', detectAdTypeNode)
  .addNode('blueprint', blueprintNode)
  .addNode('pexels', pexelsNode)
  .addNode('draft', draftNode)
  .addNode('review', reviewNode)
  .addNode('render', renderNode)
  .addNode('human_review', humanReviewNode)
  .addNode('apply_edits', applyEditsNode)
  .addNode('finalize', finalizeNode)
  
  .addEdge(START, 'scrape')
  .addEdge('scrape', 'classify_assets')
  .addEdge('classify_assets', 'detect_ad_type')
  .addEdge('detect_ad_type', 'blueprint')
  
  .addConditionalEdges('blueprint', routeImages, {
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