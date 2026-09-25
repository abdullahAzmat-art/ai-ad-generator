import 'dotenv/config';
import { TEMPLATES } from '../lib/templates/index.js';

const apiKey = process.env.JSON2VIDEO_API_KEY;

console.log('=== JSON2Video Debug Test ===');
console.log('API Key set?', !!apiKey);
console.log('API Key preview:', apiKey ? apiKey.slice(0, 8) + '...' : 'NOT SET / MISSING');

if (!apiKey || apiKey === 'your_json2video_api_key_here') {
  console.error('\n❌ JSON2VIDEO_API_KEY is missing in .env — this is the cause of the fetch failure.');
  process.exit(1);
}

// Build a minimal test payload with one scene
const testScene = TEMPLATES['full-bleed'](
  {
    headline: 'Test Headline',
    voiceover: 'This is a test.',
    durationSec: 3
  },
  'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg'
);

const payload = {
  resolution: '1080x1920',
  quality: 'high',
  scenes: [testScene]
};

console.log('\n=== Sending payload ===');
console.log(JSON.stringify(payload, null, 2));

try {
  const res = await fetch('https://api.json2video.com/v2/movies', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`\n=== Response: HTTP ${res.status} ===`);
  console.log(text);

} catch (err) {
  console.error('\n❌ Fetch threw an error:', err.message);
  console.error('Cause:', err.cause?.message || err.cause);
}
