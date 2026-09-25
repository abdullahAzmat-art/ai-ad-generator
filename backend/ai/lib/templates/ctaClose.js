/**
 * Layout 3 — Gold CTA Close (Photo Top / Brand Block + CTA Bottom)
 * Matches the professional reference's final scene: same warm split as the
 * gold layout, but the headline IS the call-to-action, set larger, with an
 * optional offer line beneath it.
 */

import { voiceover } from './helpers.js';

// Warm premium gold used when the scraped brand color is unavailable.
const FALLBACK_GOLD = '#C9A24B';

export function ctaClose(scene, imageUrl, brandColor) {
  const bg = brandColor || FALLBACK_GOLD;
  const dur = scene.durationSec || 4;
  const sub = (scene.subtext || '').trim();
  const hasSub = sub.length > 0;

  return {
    duration: dur,
    transition: { type: "fade", duration: 0.5 },
    elements: [

      // 1. Photo — top 55%, slow zoom-in for urgency
      {
        type: "image",
        src: imageUrl,
        x: 0,
        y: 0,
        width: 1080,
        height: 1056,
        resize: "cover",
        zoom: 3,
        start: 0,
        duration: dur
      },

      // 2. Solid brand block — bottom 45%
      {
        type: "html",
        html: `<div style="width:1080px;height:864px;background:${bg};"></div>`,
        x: 0,
        y: 1056,
        width: 1080,
        height: 864,
        start: 0,
        duration: dur
      },

      // 3. CTA text — the action line, biggest text in the video
      {
        type: "text",
        text: scene.cta || scene.headline || "Shop Now",
        x: 40,
        y: hasSub ? 1180 : 1270,
        width: 1000,
        height: 180,
        start: 0,
        duration: dur,
        keyframes: [
          { time: 0, y: hasSub ? 1220 : 1310 },
          { time: 0.4, y: hasSub ? 1180 : 1270 }
        ],
        settings: {
          "font-family": "Montserrat",
          "color": "#FFFFFF",
          "font-size": "62px",
          "font-weight": "800",
          "text-align": "center"
        },
        "fade-in": 0.25
      },

      // 4. Offer line beneath the CTA — only when present
      ...(hasSub ? [{
        type: "text",
        text: sub,
        x: 80,
        y: 1390,
        width: 920,
        height: 120,
        start: 0.4,
        duration: Math.max(0, dur - 0.4),
        settings: {
          "font-family": "Montserrat",
          "color": "rgba(255,255,255,0.85)",
          "font-size": "34px",
          "font-weight": "400",
          "text-align": "center"
        },
        "fade-in": 0.4
      }] : []),

      // 5. Voiceover
      voiceover(scene.voiceover)
    ]
  };
}
