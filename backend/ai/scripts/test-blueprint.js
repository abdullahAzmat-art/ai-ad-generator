import 'dotenv/config';
import { blueprintNode } from '../nodes/blueprint.node.js';

async function test() {
  console.log('Running blueprintNode directly...');
  try {
    const dummyState = {
      adType: 'product',
      assets: {
        productHero: "1",
        lifestyle: "2"
      }
    };
    
    const result = await blueprintNode(dummyState);
    console.log('\n--- Final Blueprint ---');
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
