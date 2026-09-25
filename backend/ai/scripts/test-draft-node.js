import 'dotenv/config';
import { draftNode } from '../nodes/draft.node.js';

async function test() {
  console.log('Running draftNode directly...');
  try {
    const dummyState = {
      adType: 'product',
      scraped: {
        title: "Apple iPhone 15",
        description: "Buy the new iPhone 15 Pro",
        pageText: "Features titanium design, A17 Pro chip, Action button, and 48MP Main camera. Free shipping and returns.",
        brandInformation: { name: "Apple" },
        productInformation: { mainProductOrService: "iPhone 15 Pro" },
        colors: ["#000000"]
      },
      blueprint: [
        {
          role: 'HOOK',
          purpose: 'Grab attention with a relatable lifestyle moment',
          durationSec: 3,
          assetTypeNeeded: 'lifestyle'
        },
        {
          role: 'PRODUCT HERO',
          purpose: 'Show the product prominently and its key features',
          durationSec: 4,
          assetTypeNeeded: 'productHero'
        }
      ],
      aspectRatio: '9:16'
    };
    
    const result = await draftNode(dummyState);
    console.log('\n--- Final Draft ---');
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
