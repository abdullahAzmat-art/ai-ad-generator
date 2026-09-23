/**
 * Layout 2 — Split Screen (Top Image / Bottom Solid Brand Color Block)
 * - Product photo on top half with zoom-out
 * - Solid brand color on bottom half
 * - scene2_headline + scene2_subtext on the color block
 * - Fade transition from previous scene
 */

import { voiceover } from './helpers.js';

export function split(scene, imageUrl, brandColor) {
  const bg = brandColor || "#111111";
  const dur = scene.durationSec || 4;

  return {
    duration: dur,
    transition: { type: "fade", duration: 0.5 },
    elements: [

      // 1. Product photo — top half only, zoom-out
      {
        type: "image",
        src: imageUrl,
        x: 0,
        y: 0,
        width: 1080,
        height: 960,
        resize: "cover",
        zoom: -3,
        start: 0,
        duration: dur
      },

      // 2. Solid brand color block — bottom half
      {
        type: "html",
        html: `<div style="width:1080px;height:960px;background:${bg};"></div>`,
        x: 0,
        y: 960,
        width: 1080,
        height: 960,
        start: 0,
        duration: dur
      },

      // 3. Headline — white, top of the color block
      {
        type: "text",
        text: scene.headline || "",
        x: 60,
        y: 1100,
        width: 960,
        height: 120,
        start: 0,
        duration: dur,
        keyframes: [
          { time: 0, y: 1150 },
          { time: 0.4, y: 1100 }
        ],
        settings: {
          "font-family": "Montserrat",
          "font-color": "#FFFFFF",
          "font-size": "48px",
          "font-weight": "800",
          "text-align": "center"
        },
        "fade-in": 0.3
      },

      // 4. Subtext — light grey, below the headline
      {
        type: "text",
        text: scene.body || "",
        x: 80,
        y: 1250,
        width: 920,
        height: 100,
        start: 0.4,
        duration: Math.max(0, dur - 0.4),
        settings: {
          "font-family": "Montserrat",
          "font-color": "#E0E0E0",
          "font-size": "32px",
          "font-weight": "400",
          "text-align": "center"
        },
        "fade-in": 0.4
      },

      // 5. Voiceover
      voiceover(scene.voiceover)
    ]
  };
}
