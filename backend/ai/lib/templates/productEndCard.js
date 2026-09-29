/**
 * Premium Minimal Product End Card
 *
 * Centered composition on a soft gradient:
 *   • Logo mark (top of center cluster)
 *   • Bold brand name
 *   • CTA line (phone / WhatsApp / website)
 *   • Website URL (brand accent)
 * The cluster is measured on the story frame and centred on whatever canvas
 * this renders to, so it stays a single balanced block at 1:1 and 16:9 too.
 * Persistent top-right QR code + bottom brand strip from helpers.
 *
 * The logo sits in an object-fit:contain box, so any logo shape — square,
 * wide, tall — lands uncut and undistorted at every aspect ratio.
 */

import { createCanvas } from '../canvas.js';
import { brandBar, qrCode, voiceover, fittedImage } from './helpers.js';

// Vertical rhythm of the cluster, measured on the 1080x1920 story frame.
const CLUSTER = {
  withLogo: { height: 633, name: 250, cta: 380, contact: 490, rule: 590 },
  textOnly: { height: 383, name: 0, cta: 130, contact: 240, rule: 340 },
};

export function productEndCard(scene, brand, canvas = createCanvas()) {
  const duration = scene.durationSec || 4;
  const contact  = brand.contact || brand.website || '';
  const cta      = scene.cta || 'Order Now';

  const shape = brand.logo ? CLUSTER.withLogo : CLUSTER.textOnly;
  const px = canvas.px;
  const clusterTop = canvas.middle(px(shape.height)) + px(40);
  const nameRow = canvas.row(920);
  const ruleX = canvas.mid(px(80));

  return {
    duration,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Soft gradient background — same language as showcase scenes
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

      // 2. Thin accent line — centered, above the cluster
      {
        type: 'html',
        html: `<div style="width:${px(80)}px;height:${px(3)}px;background:${brand.color};border-radius:2px;"></div>`,
        x: ruleX,
        y: clusterTop - px(40),
        width: px(80),
        height: px(3),
        start: 0.1,
        duration,
        'fade-in': 0.4,
      },

      // 3. Logo mark — centred at the top of the cluster, contain-fitted so
      // any logo shape shows whole.
      ...(brand.logo ? [fittedImage(brand.logo, {
        x: canvas.mid(px(400)),
        y: clusterTop,
        width: px(400),
        height: px(220),
      }, { duration, fadeIn: 0.4 })] : []),

      // 4. Brand name — bold, centered
      {
        type: 'text',
        text: brand.name || '',
        x: nameRow.x,
        y: clusterTop + px(shape.name),
        width: nameRow.width,
        height: px(100),
        start: 0.2,
        duration: Math.max(0, duration - 0.2),
        settings: {
          'font-family': 'Montserrat',
          color: '#111827',
          'font-size': `${px(60)}px`,
          'font-weight': '800',
          'text-align': 'center',
          'letter-spacing': '-1px',
        },
        'fade-in': 0.35,
      },

      // 5. CTA line (e.g. "Order Now" or phone/WhatsApp)
      {
        type: 'text',
        text: cta,
        x: nameRow.x,
        y: clusterTop + px(shape.cta),
        width: nameRow.width,
        height: px(80),
        start: 0.35,
        duration: Math.max(0, duration - 0.35),
        settings: {
          'font-family': 'Montserrat',
          color: '#374151',
          'font-size': `${px(38)}px`,
          'font-weight': '500',
          'text-align': 'center',
        },
        'fade-in': 0.35,
      },

      // 6. Contact / website — brand accent
      ...(contact ? [{
        type: 'text',
        text: contact,
        x: nameRow.x,
        y: clusterTop + px(shape.contact),
        width: nameRow.width,
        height: px(70),
        start: 0.5,
        duration: Math.max(0, duration - 0.5),
        settings: {
          'font-family': 'Montserrat',
          color: brand.color,
          'font-size': `${px(36)}px`,
          'font-weight': '700',
          'text-align': 'center',
        },
        'fade-in': 0.35,
      }] : []),

      // 7. Thin bottom accent line
      {
        type: 'html',
        html: `<div style="width:${px(80)}px;height:${px(3)}px;background:${brand.color};border-radius:2px;"></div>`,
        x: ruleX,
        y: clusterTop + px(shape.rule),
        width: px(80),
        height: px(3),
        start: 0.55,
        duration: Math.max(0, duration - 0.55),
        'fade-in': 0.4,
      },

      // 8. Persistent bottom brand strip
      ...brandBar(brand, duration, canvas),

      // 9. Persistent top-right QR code
      ...qrCode(brand, duration, canvas),

      // 10. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}
