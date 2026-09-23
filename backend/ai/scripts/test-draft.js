import 'dotenv/config';
import { draftNode } from '../nodes/draft.node.js';

const dummyState = {
  scraped: {
    title: 'Acme Coffee Co.',
    description: 'Premium specialty coffee delivered to your door. Single-origin beans, roasted fresh weekly.',
    pageText: 'We source the finest single-origin beans from Ethiopia, Colombia, and Guatemala. Every bag is roasted to order and shipped within 24 hours. Join 50,000+ coffee lovers who start their morning with Acme Coffee. Free shipping on orders over $40.',
    images: [
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
      'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg',
      'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg',
    ],
    logo: null,
    brandColor: '#6F4E37',
  },
  stockImages: [
    'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
  ],
  aspectRatio: '9:16',
  feedback: [],
  script: null,
  iterations: 0,
};

console.log('=== Running Draft Node with Dummy Data ===\n');

try {
  const result = await draftNode(dummyState);

  if (result.error) {
    console.error('\n❌ Draft Node returned error:', result.error);
  } else {
    console.log('\n✅ Draft Node succeeded!\n');
    console.log('Brand Color:', result.script.brandColor);
    console.log('Format:', result.script.format);
    console.log('\nScenes:');
    result.script.scenes.forEach((scene, i) => {
      console.log(`\n  Scene ${i + 1} (${scene.id})`);
      console.log(`    Angle     : ${scene.angle}`);
      console.log(`    Headline  : ${scene.headline}`);
      console.log(`    Body      : ${scene.body}`);
      console.log(`    CTA       : ${scene.cta}`);
      console.log(`    Duration  : ${scene.durationSec}s`);
      console.log(`    ImageIndex: ${scene.imageIndex}`);
      console.log(`    bgFrom    : ${scene.bgFrom}`);
      console.log(`    bgTo      : ${scene.bgTo}`);
    });
  }
} catch (err) {
  console.error('\n💥 Uncaught error:', err.message);
}
