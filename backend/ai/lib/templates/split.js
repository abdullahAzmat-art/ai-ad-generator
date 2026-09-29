/**
 * Layout 2 — Split (Photo / Gradient Brand Block)
 * Portrait & square: photo fills the upper share of the frame, gradient brand
 * block covers the rest with minimal headline copy.
 * Landscape (16:9): the same ingredients become a side-by-side row — photo
 * panel on the left, brand block with the copy on the right — because a
 * vertical photo squeezed into a 1920x594 top strip would be nothing but
 * cropped edges.
 * The photo is always fitted with object-fit:contain over a neutral panel,
 * so it is never cut at any ratio. Persistent brand pill + QR on every frame.
 */

import { createCanvas } from '../canvas.js';
import { brandBar, qrCode, voiceover, fittedImage } from './helpers.js';

// Warm premium gold fallback when brand color is unavailable.
const FALLBACK_GOLD = '#C9A24B';

// Share of the frame the photo keeps, and where the copy sits inside the block.
const PHOTO_SHARE = 0.55;
const HEADLINE_SHARE = { withSub: 0.1435, alone: 0.2245 };
const SUBTEXT_SHARE = 0.34;

function landscapeLayout(canvas, imageUrl, bg, dur, hasSub, scene) {
  const photoW = Math.round(canvas.w * 0.52);
  const blockX = photoW;
  const blockW = canvas.w - photoW;
  const headlineY = Math.round(canvas.h * (hasSub ? 0.34 : 0.40));
  const subtextY = Math.round(canvas.h * 0.52);
  const copyRow = { x: blockX + canvas.px(60), width: blockW - canvas.px(120) };

  return [
    // 1. Neutral photo panel — left half
    {
      type: 'html',
      html: `<div style="width:${photoW}px;height:${canvas.h}px;background:linear-gradient(160deg,#FFFFFF 0%,#F3F4F6 100%);"></div>`,
      x: 0,
      y: 0,
      width: photoW,
      height: canvas.h,
      start: 0,
      duration: dur,
    },

    // 2. Photo — whole image, never cropped
    fittedImage(imageUrl, { x: 0, y: 0, width: photoW, height: canvas.h }, { duration: dur }),

    // 3. Gradient brand block — right half
    {
      type: 'html',
      html: `<div style="width:${blockW}px;height:${canvas.h}px;background:linear-gradient(160deg,${bg} 0%,${bg}CC 100%);"></div>`,
      x: blockX,
      y: 0,
      width: blockW,
      height: canvas.h,
      start: 0,
      duration: dur,
    },

    // 4. Headline
    {
      type: 'text',
      text: scene.headline || '',
      x: copyRow.x,
      y: headlineY,
      width: copyRow.width,
      height: canvas.px(140),
      start: 0,
      duration: dur,
      keyframes: [
        { time: 0,   y: headlineY + canvas.px(40) },
        { time: 0.4, y: headlineY },
      ],
      settings: {
        'font-family': 'Montserrat',
        color: '#FFFFFF',
        'font-size': `${canvas.px(52)}px`,
        'font-weight': '700',
        'text-align': 'center',
        'letter-spacing': '-0.5px',
      },
      'fade-in': 0.3,
    },

    // 5. Subtext — only when copy provides one
    ...(hasSub ? [{
      type: 'text',
      text: (scene.subtext || '').trim(),
      x: copyRow.x,
      y: subtextY,
      width: copyRow.width,
      height: canvas.px(120),
      start: 0.4,
      duration: Math.max(0, dur - 0.4),
      settings: {
        'font-family': 'Montserrat',
        color: 'rgba(255,255,255,0.88)',
        'font-size': `${canvas.px(30)}px`,
        'font-weight': '400',
        'text-align': 'center',
      },
      'fade-in': 0.4,
    }] : []),
  ];
}

function portraitLayout(canvas, imageUrl, bg, dur, hasSub, scene) {
  const photoHeight = Math.round(canvas.h * PHOTO_SHARE);
  const blockTop = photoHeight;
  const blockHeight = canvas.h - photoHeight;
  const headlineY = blockTop + Math.round(blockHeight * (hasSub ? HEADLINE_SHARE.withSub : HEADLINE_SHARE.alone));
  const headlineRow = canvas.row(960);
  const subtextRow = canvas.row(920);

  return [
    // 1. Neutral photo panel — top of the frame
    {
      type: 'html',
      html: `<div style="width:${canvas.w}px;height:${photoHeight}px;background:linear-gradient(160deg,#FFFFFF 0%,#F3F4F6 100%);"></div>`,
      x: 0,
      y: 0,
      width: canvas.w,
      height: photoHeight,
      start: 0,
      duration: dur,
    },

    // 2. Photo — whole image, never cropped
    fittedImage(imageUrl, { x: 0, y: 0, width: canvas.w, height: photoHeight }, { duration: dur }),

    // 3. Gradient brand block — the rest of the frame (brand color → darker)
    {
      type: 'html',
      html: `<div style="width:${canvas.w}px;height:${blockHeight}px;background:linear-gradient(160deg,${bg} 0%,${bg}CC 100%);"></div>`,
      x: 0,
      y: blockTop,
      width: canvas.w,
      height: blockHeight,
      start: 0,
      duration: dur,
    },

    // 4. Headline — white, clean, slides gently up into the block
    {
      type: 'text',
      text: scene.headline || '',
      x: headlineRow.x,
      y: headlineY,
      width: headlineRow.width,
      height: canvas.px(140),
      start: 0,
      duration: dur,
      keyframes: [
        { time: 0,   y: headlineY + canvas.px(40) },
        { time: 0.4, y: headlineY },
      ],
      settings: {
        'font-family': 'Montserrat',
        color: '#FFFFFF',
        'font-size': `${canvas.px(52)}px`,
        'font-weight': '700',
        'text-align': 'center',
        'letter-spacing': '-0.5px',
      },
      'fade-in': 0.3,
    },

    // 5. Subtext — only when copy provides one
    ...(hasSub ? [{
      type: 'text',
      text: (scene.subtext || '').trim(),
      x: subtextRow.x,
      y: blockTop + Math.round(blockHeight * SUBTEXT_SHARE),
      width: subtextRow.width,
      height: canvas.px(120),
      start: 0.4,
      duration: Math.max(0, dur - 0.4),
      settings: {
        'font-family': 'Montserrat',
        color: 'rgba(255,255,255,0.88)',
        'font-size': `${canvas.px(30)}px`,
        'font-weight': '400',
        'text-align': 'center',
      },
      'fade-in': 0.4,
    }] : []),
  ];
}

export function split(scene, imageUrl, brandColor, brand = {}, canvas = createCanvas()) {
  const bg  = brandColor || FALLBACK_GOLD;
  const dur = scene.durationSec || 4;
  const hasSub = (scene.subtext || '').trim().length > 0;

  const layoutElements = canvas.landscape
    ? landscapeLayout(canvas, imageUrl, bg, dur, hasSub, scene)
    : portraitLayout(canvas, imageUrl, bg, dur, hasSub, scene);

  return {
    duration: dur,
    transition: { type: 'fade', duration: 0.6 },
    elements: [

      ...layoutElements,

      // Persistent bottom brand strip
      ...brandBar(brand, dur, canvas),

      // Persistent top-right QR code
      ...qrCode(brand, dur, canvas),

      // Voiceover
      voiceover(scene.voiceover),
    ],
  };
}
