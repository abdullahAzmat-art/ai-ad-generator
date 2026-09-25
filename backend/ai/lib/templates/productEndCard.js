import { voiceover } from './helpers.js';

export function productEndCard(scene, brand) {
  const duration = scene.durationSec || 4;
  const contact = brand.contact || brand.website;
  const elements = [
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
      html: `<div style="width:1080px;height:14px;background:${brand.color};"></div>`,
      x: 0,
      y: 0,
      width: 1080,
      height: 14,
      start: 0,
      duration,
    },
    {
      type: 'text',
      text: brand.name,
      x: 90,
      y: brand.logo ? 850 : 670,
      width: 900,
      height: 112,
      start: 0.2,
      duration: Math.max(0, duration - 0.2),
      settings: {
        'font-family': 'Montserrat',
        color: '#111827',
        'font-size': '64px',
        'font-weight': '800',
        'text-align': 'center',
      },
      'fade-in': 0.35,
    },
    {
      type: 'text',
      text: scene.cta || scene.headline || 'Discover the collection',
      x: 110,
      y: brand.logo ? 995 : 815,
      width: 860,
      height: 90,
      start: 0.4,
      duration: Math.max(0, duration - 0.4),
      settings: {
        'font-family': 'Montserrat',
        color: '#4B5563',
        'font-size': '34px',
        'font-weight': '500',
        'text-align': 'center',
      },
      'fade-in': 0.35,
    },
    {
      type: 'text',
      text: contact,
      x: 110,
      y: brand.logo ? 1165 : 985,
      width: 860,
      height: 62,
      start: 0.55,
      duration: Math.max(0, duration - 0.55),
      settings: {
        'font-family': 'Montserrat',
        color: brand.color,
        'font-size': '34px',
        'font-weight': '700',
        'text-align': 'center',
      },
      'fade-in': 0.35,
    },
    voiceover(scene.voiceover),
  ];

  if (brand.logo) {
    elements.splice(2, 0, {
      type: 'image',
      src: brand.logo,
      x: 240,
      y: 400,
      width: 600,
      height: 400,
      resize: 'contain',
      start: 0,
      duration,
      'fade-in': 0.3,
    });
  }

  return {
    duration,
    transition: { type: 'fade', duration: 0.35 },
    elements,
  };
}
