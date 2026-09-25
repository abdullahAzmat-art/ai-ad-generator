import { brandSignature, voiceover } from './helpers.js';

export function productShowcase(scene, imageUrl, brand) {
  const duration = scene.durationSec || 4;
  const subtext = (scene.subtext || '').trim();
  const productStartX = scene.animation === 'product-reveal' ? 680 : 640;
  const productEndX = 640;

  return {
    duration,
    transition: { type: 'fade', duration: 0.35 },
    elements: [
      {
        type: 'html',
        html: '<div style="width:1080px;height:1920px;background:#FFFFFF;"></div>',
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        start: 0,
        duration,
      },
      {
        type: 'html',
        html: `<div style="width:1080px;height:12px;background:${brand.color};"></div>`,
        x: 0,
        y: 0,
        width: 1080,
        height: 12,
        start: 0,
        duration,
      },
      {
        type: 'html',
        html: `<div style="width:8px;height:440px;background:${brand.color};border-radius:4px;"></div>`,
        x: 74,
        y: 600,
        width: 8,
        height: 440,
        start: 0,
        duration,
      },
      {
        type: 'text',
        text: scene.headline || '',
        x: 110,
        y: 600,
        width: 400,
        height: 250,
        start: 0,
        duration,
        settings: {
          'font-family': 'Montserrat',
          color: '#111827',
          'font-size': '58px',
          'font-weight': '800',
          'text-align': 'left',
        },
        'fade-in': 0.28,
      },
      ...(subtext ? [{
        type: 'text',
        text: subtext,
        x: 110,
        y: 895,
        width: 390,
        height: 150,
        start: 0.2,
        duration: Math.max(0, duration - 0.2),
        settings: {
          'font-family': 'Montserrat',
          color: '#4B5563',
          'font-size': '32px',
          'font-weight': '500',
          'text-align': 'left',
        },
        'fade-in': 0.3,
      }] : []),
      {
        type: 'image',
        src: imageUrl,
        x: 500,
        y: 150,
        width: 540,
        height: 1400,
        resize: 'contain',
        start: 0,
        duration,
        keyframes: [
          { time: 0, x: 530 },
          { time: 0.55, x: 500 },
        ],
        'fade-in': 0.3,
      },
      ...brandSignature(brand, duration),
      voiceover(scene.voiceover),
    ],
  };
}
