/**
 * Premium Minimal Product Showcase Scene
 *
 * Full-bleed product photography against a soft studio gradient. No split
 * panel. No loud headline blocks. The product photo is fitted with
 * object-fit:contain over the gradient so it is never cropped or squashed
 * at 1:1 or 16:9. A bottom-third caption fades in for context, and
 * persistent branding (bottom strip + top-right QR) stays on every frame.
 */

import { createCanvas } from '../canvas.js';
import { brandBar, qrCode, voiceover, escapeHtml, fittedImage } from './helpers.js';

export function productShowcase(scene, imageUrl, brand, canvas = createCanvas()) {
  const duration = scene.durationSec || 4;
  const headline = escapeHtml((scene.headline || '').trim());
  const subtext  = escapeHtml((scene.subtext  || '').trim());

  const stripHeight = canvas.px(subtext ? 220 : 140);
  // Cap the image at the region ABOVE the caption strip (and brand bar). It
  // previously spanned the full canvas height, so the contain-fit photo left
  // the space over the caption empty — the "white gap". contain centers the
  // photo inside this region, which the strip then follows directly.
  const imageRegionHeight = canvas.h - canvas.barH - stripHeight;

  return {
    duration,
    transition: { type: 'fade', duration: 0.6 },   // smooth crossfade between scenes
    elements: [

      // 1. Soft studio gradient background (white → light cool-gray)
      {
        type: 'html',
        html: `<div style="width:${canvas.w}px;height:${canvas.h}px;background:linear-gradient(160deg,#FFFFFF 0%,#F3F4F6 55%,#E8E9EC 100%);"></div>`,
        x: 0,
        y: 0,
        width: canvas.w,
        height: canvas.h,
        start: 0,
        duration,
      },

      // 2. Product image — object-fit:contain so the product is never cropped
      // or distorted at 1:1 or 16:9, whatever its native shape.
      fittedImage(imageUrl, { x: 0, y: 0, width: canvas.w, height: imageRegionHeight }, { duration, fadeIn: 0.4 }),

      // 3. Full-width caption strip — centered text, resting on the brand strip
      ...(headline ? [{
        type: 'html',
        html: `<div style="width:${canvas.w}px;height:${stripHeight}px;background:rgba(255,255,255,0.93);box-sizing:border-box;padding:${canvas.px(20)}px ${canvas.px(44)}px;display:flex;flex-direction:column;justify-content:center;align-items:center;box-shadow:0 ${canvas.px(-2)}px ${canvas.px(24)}px rgba(0,0,0,0.10);">
          <p style="margin:0;font-family:Montserrat,sans-serif;font-size:${canvas.px(60)}px;font-weight:800;color:#111827;letter-spacing:-1px;line-height:1.15;text-align:center;width:100%;">${headline}</p>
          ${subtext ? `<p style="margin:${canvas.px(12)}px 0 0;font-family:Montserrat,sans-serif;font-size:${canvas.px(40)}px;font-weight:400;color:#6B7280;line-height:1.3;text-align:center;width:100%;">${subtext}</p>` : ''}
        </div>`,
        x: 0,
        y: canvas.aboveBar(stripHeight),
        width: canvas.w,
        height: stripHeight,
        start: 0.4,
        duration: Math.max(0, duration - 0.4),
        'fade-in': 0.4,
      }] : []),

      // 4. Persistent bottom brand strip
      ...brandBar(brand, duration, canvas),

      // 5. Persistent top-right QR code
      ...qrCode(brand, duration, canvas),

      // 6. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}
