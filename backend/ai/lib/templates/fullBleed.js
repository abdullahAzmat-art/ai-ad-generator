/**
 * Layout 1 — Full Bleed (Photo + Bottom Frosted Caption + Persistent Branding)
 * Full-frame photo fitted with object-fit over its own blurred fill, frosted
 * glass caption strip resting above the brand bar, persistent brand pill +
 * QR code on every frame. The photo is never cropped at 1:1 or 16:9 — the
 * blurred backdrop fills whatever the contain fit leaves empty.
 * Every measurement comes from the canvas, so the same layout holds at 9:16,
 * 1:1 and 16:9.
 */

import { createCanvas } from '../canvas.js';
import { brandBar, qrCode, voiceover, escapeHtml, fittedPhoto } from './helpers.js';

export function fullBleed(scene, imageUrl, brand = {}, canvas = createCanvas()) {
  const dur = scene.durationSec || 4;
  const headline = escapeHtml(scene.headline);
  const sub = escapeHtml((scene.subtext || '').trim());
  const hasSub = sub.length > 0;

  const captionHeight = canvas.px(hasSub ? 170 : 100);
  const captionWidth = canvas.landscape ? canvas.w - canvas.px(120) : canvas.px(760);
  const vignetteHeight = Math.round(canvas.h * 0.365);

  return {
    duration: dur,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Photo — sharp contain over a blurred copy of itself, so the whole
      // image shows at 9:16, 1:1 and 16:9 with no cropped edges or empty bars.
      ...fittedPhoto(imageUrl, canvas, { duration: dur }),

      // 2. Soft gradient vignette at bottom so caption is readable
      {
        type: 'html',
        html: `<div style="width:${canvas.w}px;height:${vignetteHeight}px;background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 100%);"></div>`,
        x: 0,
        y: canvas.h - vignetteHeight,
        width: canvas.w,
        height: vignetteHeight,
        start: 0,
        duration: dur,
      },

      // 3. Frosted caption block — only when content exists
      ...(headline ? [{
        type: 'html',
        html: `<div style="padding:${canvas.px(20)}px ${canvas.px(32)}px;max-width:${canvas.px(700)}px;">
          <p style="margin:0;font-family:Montserrat,sans-serif;font-size:${canvas.px(38)}px;font-weight:700;color:#FFFFFF;text-shadow:0 2px 8px rgba(0,0,0,0.4);letter-spacing:-0.3px;line-height:1.2;">${headline}</p>
          ${hasSub ? `<p style="margin:${canvas.px(10)}px 0 0;font-family:Montserrat,sans-serif;font-size:${canvas.px(26)}px;font-weight:400;color:rgba(255,255,255,0.88);text-shadow:0 1px 4px rgba(0,0,0,0.3);">${sub}</p>` : ''}
        </div>`,
        x: canvas.px(60),
        y: canvas.aboveBar(captionHeight, canvas.px(100)),
        width: captionWidth,
        height: captionHeight,
        start: 0.35,
        duration: Math.max(0, dur - 0.35),
        'fade-in': 0.4,
      }] : []),

      // 4. Persistent bottom brand strip
      ...brandBar(brand, dur, canvas),

      // 5. Persistent top-right QR code
      ...qrCode(brand, dur, canvas),

      // 6. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}
