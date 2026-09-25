import 'dotenv/config';
import { detectAdTypeNode } from '../nodes/detectAdType.node.js';

async function test() {
  console.log('Running detectAdTypeNode directly...');
  try {
    const dummyState = {
      scraped: {
        title: "Apple iPhone 15",
        description: "Buy the new iPhone 15 Pro",
        pageText: "Features titanium design, A17 Pro chip, Action button, and 48MP Main camera. Free shipping and returns."
      }
    };
    
    const result = await detectAdTypeNode(dummyState);
    console.log('\n--- Final Ad Type ---');
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
