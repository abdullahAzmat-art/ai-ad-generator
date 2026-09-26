import { voiceover } from './helpers.js';

export function serviceIntro(scene, brand) {
  const duration = scene.durationSec || 4;

  const headline = (scene.headline || '').trim();
  const subtext = (scene.subtext || '').trim();

  const brandColor = brand.color || '#2563EB';

  const elements = [
    // =========================================================
    // BACKGROUND
    // =========================================================
    {
      type: 'html',
      html: `
        <div style="
          width:1080px;
          height:1920px;
          position:relative;
          overflow:hidden;
          background:#F8FAFC;
        ">

          <!-- Soft blue glow -->
          <div style="
            position:absolute;
            width:760px;
            height:760px;
            right:-380px;
            top:-260px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.07;
          "></div>

          <!-- Navy corner shape -->
          <div style="
            position:absolute;
            width:460px;
            height:460px;
            right:-230px;
            top:40px;
            border-radius:50%;
            background:#0F172A;
            opacity:0.96;
          "></div>

          <!-- Small blue accent -->
          <div style="
            position:absolute;
            width:190px;
            height:190px;
            left:-95px;
            bottom:280px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.07;
          "></div>

          <!-- Bottom glass panel -->
          <div style="
            position:absolute;
            left:55px;
            right:55px;
            bottom:70px;
            height:230px;
            border-radius:36px;
            background:rgba(255,255,255,0.86);
            border:1px solid rgba(15,23,42,0.06);
            box-shadow:0 20px 60px rgba(15,23,42,0.08);
          "></div>

        </div>
      `,
      x: 0,
      y: 0,
      width: 1080,
      height: 1920,
      start: 0,
      duration,
    },

    // Voiceover
    voiceover(scene.voiceover),
  ];

  // =========================================================
  // LOGO
  // =========================================================

  if (brand.logo) {
    elements.push({
      type: 'image',
      src: brand.logo,
      x: 300,
      y: 430,
      width: 480,
      height: 270,
      resize: 'contain',
      start: 0,
      duration,
      'fade-in': 0.45,
    });
  }

  // =========================================================
  // TOP BRAND LABEL
  // =========================================================

  if (brand.name) {
    elements.push({
      type: 'text',
      text: brand.name.toUpperCase(),
      x: 120,
      y: 760,
      width: 840,
      height: 50,
      start: 0.15,
      duration: Math.max(0, duration - 0.15),
      settings: {
        'font-family': 'Montserrat',
        color: '#64748B',
        'font-size': '22px',
        'font-weight': '700',
        'text-align': 'center',
        'letter-spacing': '2px',
      },
      'fade-in': 0.3,
    });
  }

  // =========================================================
  // ACCENT LINE
  // =========================================================

  elements.push({
    type: 'html',
    html: `
      <div style="
        width:86px;
        height:7px;
        border-radius:20px;
        background:${brandColor};
      "></div>
    `,
    x: 497,
    y: 835,
    width: 86,
    height: 7,
    start: 0.25,
    duration: Math.max(0, duration - 0.25),
    'fade-in': 0.35,
  });

  // =========================================================
  // MAIN HEADLINE
  // =========================================================

  if (headline) {
    elements.push({
      type: 'text',
      text: headline,
      x: 70,
      y: 900,
      width: 940,
      height: 240,
      start: 0.35,
      duration: Math.max(0, duration - 0.35),
      settings: {
        'font-family': 'Montserrat',
        color: '#0F172A',
        'font-size': '68px',
        'font-weight': '900',
        'text-align': 'center',
        'letter-spacing': '-1.8px',
        'line-height': '1.05',
      },
      'fade-in': 0.4,
    });
  }

  // =========================================================
  // SUBTEXT
  // =========================================================

  if (subtext) {
    elements.push({
      type: 'text',
      text: subtext,
      x: 110,
      y: 1170,
      width: 860,
      height: 150,
      start: 0.55,
      duration: Math.max(0, duration - 0.55),
      settings: {
        'font-family': 'Montserrat',
        color: '#475569',
        'font-size': '34px',
        'font-weight': '500',
        'text-align': 'center',
        'line-height': '1.25',
      },
      'fade-in': 0.4,
    });
  }

  // =========================================================
  // CTA BUTTON
  // =========================================================

  elements.push({
    type: 'html',
    html: `
      <div style="
        width:430px;
        height:105px;
        border-radius:26px;
        background:${brandColor};
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 18px 40px ${brandColor}30;
      ">
        <span style="
          color:#FFFFFF;
          font-family:Montserrat,sans-serif;
          font-size:30px;
          font-weight:800;
          letter-spacing:0.4px;
        ">
          GET STARTED
        </span>
      </div>
    `,
    x: 325,
    y: 1370,
    width: 430,
    height: 105,
    start: 0.7,
    duration: Math.max(0, duration - 0.7),
    'fade-in': 0.4,
  });

  // =========================================================
  // BOTTOM TRUST MESSAGE
  // =========================================================

  elements.push({
    type: 'text',
    text: 'PROFESSIONAL • TRUSTED • RELIABLE',
    x: 100,
    y: 1655,
    width: 880,
    height: 50,
    start: 0.9,
    duration: Math.max(0, duration - 0.9),
    settings: {
      'font-family': 'Montserrat',
      color: '#64748B',
      'font-size': '19px',
      'font-weight': '700',
      'text-align': 'center',
      'letter-spacing': '1.5px',
    },
    'fade-in': 0.3,
  });

  return {
    duration,

    transition: {
      type: 'fade',
      duration: 0.6,
    },

    elements,
  };
}