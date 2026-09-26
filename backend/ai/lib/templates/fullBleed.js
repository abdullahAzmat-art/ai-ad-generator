/**
 * Layout 1 — Full Bleed (Photo + Bottom Frosted Caption + Persistent Branding)
 * Full-frame photo with slow Ken Burns zoom, frosted glass caption strip at
 * bottom-third, persistent brand pill + QR code on every frame.
 */

import { brandBar, qrCode, voiceover } from './helpers.js';

export function fullBleed(scene, imageUrl, brand = {}) {
  const dur = scene.durationSec || 4;
  const sub = (scene.subtext || '').trim();
  const hasSub = sub.length > 0;

  return {
    duration: dur,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Full-frame photo, slow Ken Burns zoom
      {
        type: 'image',
        src: imageUrl,
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        resize: 'cover',
        zoom: 3,
        start: 0,
        duration: dur,
      },

      // 2. Soft gradient vignette at bottom so caption is readable
      {
        type: 'html',
        html: '<div style="width:1080px;height:700px;background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 100%);"></div>',
        x: 0,
        y: 1220,
        width: 1080,
        height: 700,
        start: 0,
        duration: dur,
      },

      // 3. Frosted caption block — bottom-third, only when content exists
      ...(scene.headline ? [{
        type: 'html',
        html: `<div style="padding:20px 32px;max-width:700px;">
          <p style="margin:0;font-family:Montserrat,sans-serif;font-size:38px;font-weight:700;color:#FFFFFF;text-shadow:0 2px 8px rgba(0,0,0,0.4);letter-spacing:-0.3px;line-height:1.2;">${scene.headline}</p>
          ${hasSub ? `<p style="margin:10px 0 0;font-family:Montserrat,sans-serif;font-size:26px;font-weight:400;color:rgba(255,255,255,0.88);text-shadow:0 1px 4px rgba(0,0,0,0.3);">${sub}</p>` : ''}
        </div>`,
        x: 60,
        y: hasSub ? 1490 : 1560,
        width: 760,
        height: hasSub ? 170 : 100,
        start: 0.35,
        duration: Math.max(0, dur - 0.35),
        'fade-in': 0.4,
      }] : []),

      // 4. Persistent bottom-left brand pill
      ...brandBar(brand, dur),

      // 5. Persistent top-right QR code
      ...qrCode(brand, dur),

      // 6. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}
