import 'dotenv/config';
import { classifyAssetsNode } from '../nodes/classifyAssets.node.js';

async function test() {
  console.log('Running classifyAssetsNode directly...');
  try {
    // Mock the state returned by scrape node
    const dummyState = {
      scraped: {
        images: [
          'https://example.com/product-front.jpg',
          'https://example.com/product-side.jpg',
          'https://example.com/lifestyle-wearing-product.jpg',
          'https://example.com/team-photo.jpg'
        ],
        logo: 'https://example.com/logo.png',
      }
    };
    
    const result = await classifyAssetsNode(dummyState);
    console.log('\n--- Final Classified Assets ---');
    console.dir(result.assets, { depth: null });
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
