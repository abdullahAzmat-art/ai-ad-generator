/**
 * Layout 3 — CTA Close (Full-Bleed Photo + Bottom CTA Overlay)
 *
 * The photo runs the full canvas via `fittedPhoto` — sharp object-fit:contain
 * over a blurred copy of itself — so nothing is cropped at 1:1 or 16:9, and
 * the CTA gradient band is laid on TOP of it as an overlay instead of stacked
 * in a boxed section underneath. The band covers the lower share of whatever
 * frame this scene renders on.
 */

import { createCanvas } from '../canvas.js';
import { brandBar, qrCode, voiceover, fittedPhoto } from './helpers.js';

// Warm premium gold used when the scraped brand color is unavailable.
const FALLBACK_GOLD = '#e2dfda';

// Share of the frame the CTA band claims, and where its copy sits inside it.
const BAND_SHARE = 0.45;
const CTA_SHARE = { withSub: 0.1204, alone: 0.213 };
// The offer line hangs off the CTA block, so the two never touch on a short canvas.
const OFFER_GAP = 200;

export function ctaClose(scene, imageUrl, brandColor, brand = {}, canvas = createCanvas()) {
  const bg = brandColor || FALLBACK_GOLD;
  const dur = scene.durationSec || 4;
  const sub = (scene.subtext || '').trim();
  const hasSub = sub.length > 0;

  const bandHeight = Math.round(canvas.h * BAND_SHARE);
  const bandTop = canvas.h - bandHeight;
  const ctaY = bandTop + Math.round(bandHeight * (hasSub ? CTA_SHARE.withSub : CTA_SHARE.alone));
  const ctaRow = canvas.row(1000);
  const offerRow = canvas.row(920);

  return {
    duration: dur,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Photo — sharp contain over its own blurred fill, so the full image
      // shows at any aspect ratio and the CTA band still has photo texture
      // behind it down to the bottom edge.
      ...fittedPhoto(imageUrl, canvas, { duration: dur }),

      // 2. Gradient CTA band — overlaid on the bottom of the photo. Fades from
      // transparent (blends into the photo) to solid brand color at the very
      // bottom, so there is no hard seam behind the full-height photo.
      {
        type: 'html',
        html: `<div style="width:${canvas.w}px;height:${bandHeight}px;background:linear-gradient(180deg, ${bg}00 0%, ${bg}E6 35%, ${bg} 100%);"></div>`,
        x: 0,
        y: bandTop,
        width: canvas.w,
        height: bandHeight,
        start: 0,
        duration: dur,
      },

      // 3. CTA text — the action line
      {
        type: 'text',
        text: scene.cta || scene.headline || 'Shop Now',
        x: ctaRow.x,
        y: ctaY,
        width: ctaRow.width,
        height: canvas.px(180),
        start: 0,
        duration: dur,
        keyframes: [
          { time: 0, y: ctaY + canvas.px(40) },
          { time: 0.4, y: ctaY },
        ],
        settings: {
          'font-family': 'Montserrat',
          color: '#ece9e9',
          'font-size': `${canvas.px(60)}px`,
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
        x: offerRow.x,
        y: ctaY + canvas.px(OFFER_GAP),
        width: offerRow.width,
        height: canvas.px(120),
        start: 0.4,
        duration: Math.max(0, dur - 0.4),
        settings: {
          'font-family': 'Montserrat',
          color: 'rgba(255,255,255,0.88)',
          'font-size': `${canvas.px(32)}px`,
          'font-weight': '400',
          'text-align': 'center',
        },
        'fade-in': 0.4,
      }] : []),

      // 5. Persistent bottom brand strip
      ...brandBar(brand, dur, canvas),

      // 6. Persistent top-right QR code
      ...qrCode(brand, dur, canvas),

      // 7. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}
