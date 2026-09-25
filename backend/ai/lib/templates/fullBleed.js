/**
 * Layout 1 — Dark Hero (Full Bleed + Bottom Translucent Strip)
 * Matches the professional reference: full-frame moody photo with a slow
 * zoom, a translucent black strip across the bottom 30%, and one bold white
 * headline centered inside the strip.
 */

import { voiceover } from './helpers.js';

export function fullBleed(scene, imageUrl) {
  const dur = scene.durationSec || 4;
  const sub = (scene.subtext || '').trim();
  const hasSub = sub.length > 0;

  return {
    duration: dur,
    transition: { type: "fade", duration: 0.5 },
    elements: [

      // 1. Full-frame photo, slow zoom-in
      {
        type: "image",
        src: imageUrl,
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        resize: "cover",
        zoom: 3,
        start: 0,
        duration: dur
      },

      // 2. Translucent black strip — bottom 30%
      {
        type: "html",
        html: '<div style="width:1080px;height:580px;background:rgba(0,0,0,0.5);"></div>',
        x: 0,
        y: 1340,
        width: 1080,
        height: 580,
        start: 0,
        duration: dur
      },

      // 3. Headline — white bold, slides gently up into the strip
      {
        type: "text",
        text: scene.headline || "",
        x: 60,
        y: hasSub ? 1460 : 1520,
        width: 960,
        height: 160,
        start: 0,
        duration: dur,
        keyframes: [
          { time: 0, y: hasSub ? 1500 : 1560 },
          { time: 0.5, y: hasSub ? 1460 : 1520 }
        ],
        settings: {
          "font-family": "Montserrat",
          "color": "#FFFFFF",
          "font-size": "54px",
          "font-weight": "700",
          "text-align": "center"
        },
        "fade-in": 0.4
      },

      // 4. Subtext — only when the copy provides one
      ...(hasSub ? [{
        type: "text",
        text: sub,
        x: 80,
        y: 1640,
        width: 920,
        height: 120,
        start: 0.4,
        duration: Math.max(0, dur - 0.4),
        settings: {
          "font-family": "Montserrat",
          "color": "#E8E8E8",
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
