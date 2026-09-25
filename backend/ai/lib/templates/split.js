/**
 * Layout 2 — Gold Split (Photo Top / Solid Brand Block Bottom)
 * Matches the professional reference: lifestyle photo filling the top 55%
 * with a slow zoom, a solid warm gold block on the bottom 45%, and one bold
 * white headline centered near the top of the block.
 */

import { voiceover } from './helpers.js';

// Warm premium gold used when the scraped brand color is unavailable.
const FALLBACK_GOLD = '#C9A24B';

export function split(scene, imageUrl, brandColor) {
  const bg = brandColor || FALLBACK_GOLD;
  const dur = scene.durationSec || 4;
  const sub = (scene.subtext || '').trim();
  const hasSub = sub.length > 0;

  return {
    duration: dur,
    transition: { type: "fade", duration: 0.5 },
    elements: [

      // 1. Photo — top 55% of the canvas, slow zoom
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

      // 3. Headline — white bold, slides gently up inside the block
      {
        type: "text",
        text: scene.headline || "",
        x: 60,
        y: hasSub ? 1210 : 1280,
        width: 960,
        height: 140,
        start: 0,
        duration: dur,
        keyframes: [
          { time: 0, y: hasSub ? 1250 : 1320 },
          { time: 0.4, y: hasSub ? 1210 : 1280 }
        ],
        settings: {
          "font-family": "Montserrat",
          "color": "#FFFFFF",
          "font-size": "54px",
          "font-weight": "800",
          "text-align": "center"
        },
        "fade-in": 0.3
      },

      // 4. Subtext — only when the copy provides one
      ...(hasSub ? [{
        type: "text",
        text: sub,
        x: 80,
        y: 1380,
        width: 920,
        height: 120,
        start: 0.4,
        duration: Math.max(0, dur - 0.4),
        settings: {
          "font-family": "Montserrat",
          "color": "rgba(255,255,255,0.85)",
          "font-size": "32px",
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
