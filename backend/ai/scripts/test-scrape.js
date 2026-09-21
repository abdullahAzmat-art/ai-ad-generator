import { adGraph } from '../graph/index.js';

const url = process.argv[2];

if (!url) {
  console.error('Usage: node ai/scripts/test-scrape.js <url>');
  process.exit(1);
}

const result = await adGraph.invoke({ url });
const { scraped } = result;

console.log({
  stockImages: result.stockImages,
  images: scraped.images,
  logo: scraped.logo,
  brandColor: scraped.brandColor,
  title: scraped.title,
  pageText: scraped.pageText.slice(0, 200),
});