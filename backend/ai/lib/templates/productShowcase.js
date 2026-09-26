/**
 * Premium Minimal Product Showcase Scene
 *
 * Full-bleed product photography with Ken Burns slow-zoom against a
 * soft studio gradient. No split panel. No loud headline blocks.
 * A small bottom-third caption fades in for context, and persistent
 * branding (bottom-left pill + top-right QR) stays on every frame.
 */

import { brandBar, qrCode, voiceover } from './helpers.js';

export function productShowcase(scene, imageUrl, brand) {
  const duration = scene.durationSec || 4;
  const headline = (scene.headline || '').trim();
  const subtext  = (scene.subtext  || '').trim();

  // Ken Burns: subtle integer zoom (JSON2Video requires an integer)
  const zoomLevel = 2; // 2 = subtle slow zoom-in

  // FIXED: this used to be a manual { x0, y0 } pixel offset applied on top
  // of a `resize:"cover"` image. Since `resize` sizes the image against the
  // FULL CANVAS regardless of width/height, that offset was shifting the
  // already-canvas-sized image away from the frame — opening a gap on one
  // edge and pushing the image off-frame on the other (the "gap, then half
  // image" bug). `pan` is the property JSON2Video actually built for this:
  // it moves within a resize'd image while it's zooming, without ever
  // exposing an edge. `hook` gets none — just the zoom, no drift.
  const panMap = {
    hook: null,
    'product-hero': 'left',
    benefits: 'top',
    offer: 'right',
  };
  const pan = panMap[scene.role] || null;

  return {
    duration,
    transition: { type: 'fade', duration: 0.6 },   // smooth crossfade between scenes
    elements: [

      // 1. Soft studio gradient background (white → light cool-gray)
      {
        type: 'html',
        html: '<div style="width:1080px;height:1920px;background:linear-gradient(160deg,#FFFFFF 0%,#F3F4F6 55%,#E8E9EC 100%);"></div>',
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        start: 0,
        duration,
      },

      // 2. Full-frame product image — Ken Burns slow zoom + native pan.
      // No manual x/y offset anymore — resize:"cover" owns the full-canvas
      // sizing, and `pan` (not x/y) handles the drift, safely.
      {
        type: 'image',
        src: imageUrl,
        resize: 'cover',            // Fills the entire screen, preventing empty space
        zoom: zoomLevel,            // integer required by JSON2Video
        ...(pan ? { pan } : {}),
        start: 0,
        duration,
        'fade-in': 0.4,
      },

      // 3. Full-width caption strip — centered text
      ...(headline ? [{
        type: 'html',
        html: `<div style="width:1080px;height:${subtext ? 220 : 140}px;background:rgba(255,255,255,0.93);box-sizing:border-box;padding:20px 44px;display:flex;flex-direction:column;justify-content:center;align-items:center;box-shadow:0 -2px 24px rgba(0,0,0,0.10);">
          <p style="margin:0;font-family:Montserrat,sans-serif;font-size:60px;font-weight:800;color:#111827;letter-spacing:-1px;line-height:1.15;text-align:center;width:100%;">${headline}</p>
          ${subtext ? `<p style="margin:12px 0 0;font-family:Montserrat,sans-serif;font-size:40px;font-weight:400;color:#6B7280;line-height:1.3;text-align:center;width:100%;">${subtext}</p>` : ''}
        </div>`,
        x: 0,
        y: subtext ? 1550 : 1610,
        width: 1080,
        height: subtext ? 220 : 140,
        start: 0.4,
        duration: Math.max(0, duration - 0.4),
        'fade-in': 0.4,
      }] : []),

      // 4. Persistent bottom-left brand pill
      ...brandBar(brand, duration),

      // 5. Persistent top-right QR code
      ...qrCode(brand, duration),

      // 6. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}