import { scrapeUrl } from '../lib/firecrawl.js';

export async function scrapeNode(state) {
  const scraped = await scrapeUrl(state.url);
  return { scraped };
}