/**
 * Layout 3 — CTA Scene (Full Bleed Zoom-In + Bottom Bar)
 * - Full frame image with zoom-in
 * - Solid black bar at the very bottom
 * - scene3_cta only — gold text on the black bar
 * - NO second text block on this scene
 * - Fade transition from previous scene
 */

import { voiceover } from './helpers.js';

export function ctaClose(scene, imageUrl) {
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

      // 2. Solid black bar at the bottom
      {
        type: "html",
        html: '<div style="width:1080px;height:320px;background:#000000;"></div>',
        x: 0,
        y: 1600,
        width: 1080,
        height: 320,
        start: 0,
        duration: dur
      },

      // 3. CTA text only — gold, one line, no second text block rendered
      {
        type: "text",
        text: scene.cta || scene.headline || "SHOP NOW",
        x: 60,
        y: 1660,
        width: 960,
        height: 200,
        start: 0,
        duration: dur,
        settings: {
          "font-family": "Montserrat",
          "font-color": "#FFD700",
          "font-size": "56px",
          "font-weight": "800",
          "text-align": "center"
        },
        "fade-in": 0.2
      },

      // 4. Voiceover
      voiceover(scene.voiceover)
    ]
  };
}
