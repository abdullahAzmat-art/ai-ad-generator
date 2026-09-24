import { Annotation } from "@langchain/langgraph";

const overwrite = (init) => Annotation({ reducer: (_a, b) => b, default: () => init });

/**
 * @typedef {Object} Scraped
 * @property {string} title
 * @property {string} description
 * @property {string} pageText
 * @property {string[]} images
 * @property {string|null} logo
 * @property {string} brandColor
 */

export const AdState = Annotation.Root({
  // input (from the API request)
  url: Annotation(),
  aspectRatio: overwrite("9:16"),

  // scrape node
  scraped: overwrite(null),         // Scraped

  // classify assets node
  assets: overwrite(null),          // categorized images
  
  // detect ad type node
  adType: overwrite(null),          // e.g. "product", "service", "business"

  // blueprint node
  blueprint: overwrite(null),       // creative plan structure
  missingAssets: overwrite([]),     // assets needed from Pexels

  // pexels node
  stockImages: overwrite([]),       // which images came from Pexels (UI can show a "stock" badge)

  // draft node
  script: overwrite(null),          // { scenes: [3], brandColor }

  // review node
  feedback: overwrite([]),          // issues the reviewer found
  approved: overwrite(false),
  iterations: overwrite(0),         // review rounds so far

  // render node
  videoUrl: overwrite(null),
  error: overwrite(null),

  // human_review / apply_edits
  decision: overwrite(null),        // { action: "approve" } | { action: "edit", edits }
  editCount: overwrite(0),
});