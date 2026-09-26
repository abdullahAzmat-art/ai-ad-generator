/**
 * Layout 2 — Split (Photo Top / Gradient Brand Block Bottom)
 * Lifestyle photo fills the top 55% with slow zoom, a soft gradient brand
 * block covers the bottom 45% with minimal headline copy.
 * Persistent brand pill + QR code on every frame.
 */

import { brandBar, qrCode, voiceover } from './helpers.js';

// Warm premium gold fallback when brand color is unavailable.
const FALLBACK_GOLD = '#C9A24B';

export function split(scene, imageUrl, brandColor, brand = {}) {
  const bg  = brandColor || FALLBACK_GOLD;
  const dur = scene.durationSec || 4;
  const sub = (scene.subtext || '').trim();
  const hasSub = sub.length > 0;

  return {
    duration: dur,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Photo — top 55%, slow Ken Burns zoom
      {
        type: 'image',
        src: imageUrl,
        x: 0,
        y: 0,
        width: 1080,
        height: 1056,
        resize: 'cover',
        zoom: 3,
        start: 0,
        duration: dur,
      },

      // 2. Gradient brand block — bottom 45% (brand color → slightly darker)
      {
        type: 'html',
        html: `<div style="width:1080px;height:864px;background:linear-gradient(160deg,${bg} 0%,${bg}CC 100%);"></div>`,
        x: 0,
        y: 1056,
        width: 1080,
        height: 864,
        start: 0,
        duration: dur,
      },

      // 3. Headline — white, clean, slides gently up into the block
      {
        type: 'text',
        text: scene.headline || '',
        x: 60,
        y: hasSub ? 1180 : 1250,
        width: 960,
        height: 140,
        start: 0,
        duration: dur,
        keyframes: [
          { time: 0,   y: hasSub ? 1220 : 1290 },
          { time: 0.4, y: hasSub ? 1180 : 1250 },
        ],
        settings: {
          'font-family': 'Montserrat',
          color: '#FFFFFF',
          'font-size': '52px',
          'font-weight': '700',
          'text-align': 'center',
          'letter-spacing': '-0.5px',
        },
        'fade-in': 0.3,
      },

      // 4. Subtext — only when copy provides one
      ...(hasSub ? [{
        type: 'text',
        text: sub,
        x: 80,
        y: 1350,
        width: 920,
        height: 120,
        start: 0.4,
        duration: Math.max(0, dur - 0.4),
        settings: {
          'font-family': 'Montserrat',
          color: 'rgba(255,255,255,0.88)',
          'font-size': '30px',
          'font-weight': '400',
          'text-align': 'center',
        },
        'fade-in': 0.4,
      }] : []),

      // 5. Persistent bottom-left brand pill
      ...brandBar(brand, dur),

      // 6. Persistent top-right QR code
      ...qrCode(brand, dur),

      // 7. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}
