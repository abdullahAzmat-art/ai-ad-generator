/**
 * Premium Minimal Product End Card
 *
 * Perfectly centered composition on a soft gradient:
 *   • Logo mark (top of center cluster)
 *   • Bold brand name
 *   • CTA line (phone / WhatsApp / website)
 *   • Website URL (gold accent)
 * Persistent top-right QR code + bottom-left brand pill from helpers.
 *
 * FIXED: the logo image had `resize:"contain"` together with explicit
 * `width:400, height:220`. Per JSON2Video's docs, setting `resize` makes
 * width/height IGNORED — so that 400x220 box was never actually applied.
 * Removed `resize` so the width/height you already specified finally does
 * what you intended.
 */

import { brandBar, qrCode, voiceover } from './helpers.js';

export function productEndCard(scene, brand) {
  const duration = scene.durationSec || 4;
  const contact  = brand.contact || brand.website || '';
  const cta      = scene.cta || 'Order Now';

  // Vertically center a cluster of ~560px height in a 1920px canvas → top ~680
  const clusterTop = 680;

  return {
    duration,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      // 1. Soft gradient background — same language as showcase scenes
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

      // 2. Thin gold accent line — centered, above the cluster
      {
        type: 'html',
        html: `<div style="width:80px;height:3px;background:${brand.color};border-radius:2px;"></div>`,
        x: 500,
        y: clusterTop - 40,
        width: 80,
        height: 3,
        start: 0.1,
        duration,
        'fade-in': 0.4,
      },

      // 3. Logo mark — centered at the top of the cluster. No `resize`, so
      // the 400x220 box actually applies now instead of being ignored.
      ...(brand.logo ? [{
        type: 'image',
        src: brand.logo,
        x: 340,
        y: clusterTop,
        width: 400,
        height: 220,
        start: 0,
        duration,
        'fade-in': 0.4,
      }] : []),

      // 4. Brand name — bold, centered
      {
        type: 'text',
        text: brand.name || '',
        x: 80,
        y: brand.logo ? clusterTop + 250 : clusterTop,
        width: 920,
        height: 100,
        start: 0.2,
        duration: Math.max(0, duration - 0.2),
        settings: {
          'font-family': 'Montserrat',
          color: '#111827',
          'font-size': '60px',
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
        x: 80,
        y: brand.logo ? clusterTop + 380 : clusterTop + 130,
        width: 920,
        height: 80,
        start: 0.35,
        duration: Math.max(0, duration - 0.35),
        settings: {
          'font-family': 'Montserrat',
          color: '#374151',
          'font-size': '38px',
          'font-weight': '500',
          'text-align': 'center',
        },
        'fade-in': 0.35,
      },

      // 6. Contact / website — gold accent
      ...(contact ? [{
        type: 'text',
        text: contact,
        x: 80,
        y: brand.logo ? clusterTop + 490 : clusterTop + 240,
        width: 920,
        height: 70,
        start: 0.5,
        duration: Math.max(0, duration - 0.5),
        settings: {
          'font-family': 'Montserrat',
          color: brand.color,
          'font-size': '36px',
          'font-weight': '700',
          'text-align': 'center',
        },
        'fade-in': 0.35,
      }] : []),

      // 7. Thin bottom accent line
      {
        type: 'html',
        html: `<div style="width:80px;height:3px;background:${brand.color};border-radius:2px;"></div>`,
        x: 500,
        y: brand.logo ? clusterTop + 590 : clusterTop + 340,
        width: 80,
        height: 3,
        start: 0.55,
        duration: Math.max(0, duration - 0.55),
        'fade-in': 0.4,
      },

      // 8. Persistent bottom-left brand pill
      ...brandBar(brand, duration),

      // 9. Persistent top-right QR code
      ...qrCode(brand, duration),

      // 10. Voiceover
      voiceover(scene.voiceover),
    ],
  };
}