/**
 * Product Showcase Scene
 *
 * Layout (measured on the 1080x1920 story frame, every value scaled through
 * canvas.px() so 1:1 and 16:9 keep the same composition):
 *
 *   ┌─ movie-level chrome (productChrome, added in render.node.js) ─────┐
 *   │  logo x:40 y:25 90x90 · name right-aligned x:900 y:55 28px ebony     │
 *   ├───────────────────────────────────────────────────────────────────┤
 *   │  HERO  x:0 y:154 w:1080 h:866   (fills the box, no gaps)            │
 *   │  headline  centered x:540 y:1055  56px bold #1A1A1A                 │
 *   │  subtext   centered x:540 y:1145  32px #5A5A5A                      │
 *   │  CTA bar   x:0 y:1690 w:1080 h:118  ebony + white 36px bold          │
 *   ├───────────────────────────────────────────────────────────────────┤
 *   │  bottom strip  x:0 y:1882 w:1080 h:38  solid ebony                  │
 *   └───────────────────────────────────────────────────────────────────┘
 *
 * All copy is dynamic: business name, logo, headline, subtext and CTA come
 * from the scraped data + LLM script. No QR code anywhere in the product flow.
 */

import { createCanvas } from '../canvas.js';
import { voiceover, escapeHtml, fittedImage } from './helpers.js';

export function productShowcase(scene, imageUrl, brand, canvas = createCanvas()) {
  const duration = scene.durationSec || 4;
  const headline = (scene.headline || '').trim();
  const subtext  = (scene.subtext  || '').trim();
  // CTA copy: scene-level CTA from the script wins; fall back to the business
  // phone/email, then the website — whatever the scrape actually found.
  const ctaText  = (scene.cta || brand.contact || brand.website || '').trim();
  // Fixed ebony accent — the scraped brand color is skipped here because
  // gold/yellow tints read cheap against the off-white backdrop.
  const accent   = '#1A1A1A';

  return {
    duration,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Warm off-white studio backdrop
      {
        type: 'html',
        html: `<div style="width:${canvas.w}px;height:${canvas.h}px;background:#FAF7F2;"></div>`,
        x: 0,
        y: 0,
        width: canvas.w,
        height: canvas.h,
        start: 0,
        duration,
      },

      // 2. Hero product image — fills x:0 y:154 w:1080 h:866 edge to edge.
      // cover keeps the box gapless at any source ratio.
      fittedImage(imageUrl, { x: 0, y: canvas.px(154), width: canvas.w, height: canvas.px(866) }, { duration, fit: 'cover', fadeIn: 0.4 }),

      // 3. Headline — centered directly below the hero image
      ...(headline ? [{
        type: 'text',
        text: headline,
        x: 0,
        y: canvas.px(1055),
        width: canvas.w,
        height: canvas.px(80),
        start: 0.2,
        duration: Math.max(0, duration - 0.2),
        settings: {
          'font-family': 'Montserrat',
          color: '#1A1A1A',
          'font-size': `${canvas.px(56)}px`,
          'font-weight': '800',
          'text-align': 'center',
          'letter-spacing': '-1px',
        },
        'fade-in': 0.35,
      }] : []),

      // 4. Subtext / offer line — centered directly below the headline
      ...(subtext ? [{
        type: 'text',
        text: subtext,
        x: 0,
        y: canvas.px(1145),
        width: canvas.w,
        height: canvas.px(56),
        start: 0.3,
        duration: Math.max(0, duration - 0.3),
        settings: {
          'font-family': 'Montserrat',
          color: '#5A5A5A',
          'font-size': `${canvas.px(32)}px`,
          'font-weight': '400',
          'text-align': 'center',
        },
        'fade-in': 0.35,
      }] : []),

      // 5. CTA bar — solid brand-color strip, centered white bold CTA text
      ...(ctaText ? [{
        type: 'html',
        html: `<div style="width:${canvas.w}px;height:${canvas.px(118)}px;background:${accent};display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:0 ${canvas.px(40)}px;">
          <span style="font-family:Montserrat,sans-serif;font-size:${canvas.px(36)}px;font-weight:700;color:#FFFFFF;white-space:nowrap;">${escapeHtml(ctaText)}</span>
        </div>`,
        x: 0,
        y: canvas.px(1690),
        width: canvas.w,
        height: canvas.px(118),
        start: 0.3,
        duration: Math.max(0, duration - 0.3),
        'fade-in': 0.4,
      }] : []),

      // 6. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}

/**
 * Movie-level brand chrome for product ads — persists on EVERY scene
 * (showcase scenes and the end card) for the whole video duration.
 * Top bar: logo at x:40 y:25 (90x90) + business name right-aligned at
 * x:900 y:55 (28px, ebony, weight 500). Bottom: solid ebony strip
 * x:0 y:1882 w:1080 h:38, no text or icon inside it.
 */
export function productChrome(brand, duration, canvas = createCanvas()) {
  const name = (brand.name || '').trim();
  const accent = '#1A1A1A';

  return [
    // Top bar — logo mark
    ...(brand.logo ? [fittedImage(brand.logo, {
      x: canvas.px(40),
      y: canvas.px(25),
      width: canvas.px(90),
      height: canvas.px(90),
    }, { duration })] : []),

    // Top bar — business name, right-aligned beside the logo
    ...(name ? [{
      type: 'text',
      text: name,
      x: canvas.px(900),
      y: canvas.px(55),
      width: canvas.w - canvas.px(900) - canvas.px(40),
      height: canvas.px(44),
      start: 0,
      duration,
      settings: {
        'font-family': 'Montserrat',
        color: '#1A1A1A',
        'font-size': `${canvas.px(28)}px`,
        'font-weight': '500',
        'text-align': 'right',
      },
    }] : []),

    // Bottom strip — plain brand-color band, nothing inside it
    {
      type: 'html',
      html: `<div style="width:${canvas.w}px;height:${canvas.px(38)}px;background:${accent};"></div>`,
      x: 0,
      y: canvas.px(1882),
      width: canvas.w,
      height: canvas.px(38),
      start: 0,
      duration,
    },
  ];
}
