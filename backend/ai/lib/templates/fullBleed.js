/**
 * Layout 1 — Hook Scene (Full Bleed + Bottom Overlay Guard)
 * - Full frame image with zoom-in effect
 * - Semi-transparent black overlay at the bottom
 * - scene1_headline white text on the overlay
 * - Fade transition to next scene
 */

import { voiceover } from './helpers.js';

export function fullBleed(scene, imageUrl) {
  const dur = scene.durationSec || 4;

  return {
    duration: dur,
    transition: { type: "fade", duration: 0.5 },
    elements: [

      // 1. Full-frame background image with zoom-in
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

      // 2. Semi-transparent black overlay (bottom guard)
      {
        type: "html",
        html: '<div style="width:1080px;height:520px;background:rgba(0,0,0,0.75);"></div>',
        x: 0,
        y: 1400,
        width: 1080,
        height: 520,
        start: 0,
        duration: dur
      },

      // 3. Headline text — white, centered, on top of the overlay
      {
        type: "text",
        text: scene.headline || "",
        x: 60,
        y: 1450,
        width: 960,
        height: 260,
        start: 0,
        duration: dur,
        settings: {
          "font-family": "Montserrat",
          "font-color": "#FFFFFF",
          "font-size": "52px",
          "font-weight": "700",
          "text-align": "center"
        },
        "fade-in": 0.4,
        "fade-out": 0.3
      },

      // 4. Voiceover
      voiceover(scene.voiceover)
    ]
  };
}
