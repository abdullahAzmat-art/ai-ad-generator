import 'dotenv/config';
import { scrapeNode } from '../nodes/scrape.node.js';

// We will mock the scrapeUrl function by overriding it in the module cache if possible,
// but in ESM it's easier to just temporarily pass a dummy state if we edit scrapeNode,
// or we can just run the node and let it hit firecrawl with a lightweight URL.

async function test() {
  console.log('Running scrapeNode directly...');
  try {
    const result = await scrapeNode({ url: 'https://example.com' });
    console.log('\n--- Final Scraped Output ---');
    console.dir(result.scraped, { depth: null });
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
