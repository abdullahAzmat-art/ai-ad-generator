/**
 * Layout 3 — CTA Close (Full-Bleed Photo + Bottom CTA Overlay)
 *
 * FIXED: the photo element had `resize:"cover"` together with explicit
 * `width:1080, height:1056` (the "top 55%" box). Per JSON2Video's docs,
 * setting `resize` makes width/height IGNORED — so that box was never
 * actually being applied, and the photo was reflowing against some other
 * default sizing instead. That's the most likely cause of the overflow/
 * misalignment in the last scene.
 *
 * Fix: let the photo go true full-bleed (resize:"cover", no width/height —
 * same pattern as productShowcase.js), then lay the CTA gradient band on
 * TOP of the full photo as an overlay, instead of stacking it in a separate
 * boxed section below a photo that was never actually confined to its box.
 */

import { brandBar, qrCode, voiceover } from './helpers.js';

// Warm premium gold used when the scraped brand color is unavailable.
const FALLBACK_GOLD = '#C9A24B';

export function ctaClose(scene, imageUrl, brandColor, brand = {}) {
  const bg = brandColor || FALLBACK_GOLD;
  const dur = scene.durationSec || 4;
  const sub = (scene.subtext || '').trim();
  const hasSub = sub.length > 0;

  return {
    duration: dur,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Full-bleed photo — fills the whole 1080x1920 canvas, no x/y/
      // width/height fighting `resize`. Continuous zoom so it's never a
      // dead static frame.
      {
        type: 'image',
        src: imageUrl,
        resize: 'cover',
        zoom: 3,
        pan: 'top',
        start: 0,
        duration: dur,
      },

      // 2. Gradient CTA band — overlaid on the bottom ~45% of the photo.
      // Fades from transparent (blends into the photo) to solid brand
      // color at the very bottom, so there's no hard seam now that the
      // photo runs the full height behind it.
      {
        type: 'html',
        html: `<div style="width:1080px;height:864px;background:linear-gradient(180deg, ${bg}00 0%, ${bg}E6 35%, ${bg} 100%);"></div>`,
        x: 0,
        y: 1056,
        width: 1080,
        height: 864,
        start: 0,
        duration: dur,
      },

      // 3. CTA text — the action line
      {
        type: 'text',
        text: scene.cta || scene.headline || 'Shop Now',
        x: 40,
        y: hasSub ? 1160 : 1240,
        width: 1000,
        height: 180,
        start: 0,
        duration: dur,
        keyframes: [
          { time: 0, y: hasSub ? 1200 : 1280 },
          { time: 0.4, y: hasSub ? 1160 : 1240 },
        ],
        settings: {
          'font-family': 'Montserrat',
          color: '#FFFFFF',
          'font-size': '60px',
          'font-weight': '800',
          'text-align': 'center',
          'letter-spacing': '-0.5px',
        },
        'fade-in': 0.25,
      },

      // 4. Offer line beneath the CTA — only when present
      ...(hasSub ? [{
        type: 'text',
        text: sub,
        x: 80,
        y: 1360,
        width: 920,
        height: 120,
        start: 0.4,
        duration: Math.max(0, dur - 0.4),
        settings: {
          'font-family': 'Montserrat',
          color: 'rgba(255,255,255,0.88)',
          'font-size': '32px',
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