import { createCanvas } from '../canvas.js';
import { voiceover, fittedImage } from './helpers.js';

// Each row's distance from the top of the composition, measured on the
// 1080x1920 story frame. The whole cluster hangs from its bottom margin, so the
// same rhythm survives on a square or landscape canvas.
const ROW = {
  logo: 0,
  name: 330,
  rule: 405,
  headline: 470,
  subtext: 740,
  button: 940,
  trust: 1225,
};
const LOGO_TO_PANEL_BOTTOM = 1420;
const PANEL_BOTTOM_MARGIN = 70;

export function serviceIntro(scene, brand, canvas = createCanvas()) {
  const duration = scene.durationSec || 4;

  const headline = (scene.headline || '').trim();
  const subtext = (scene.subtext || '').trim();

  const brandColor = brand.color || '#2563EB';

  const px = canvas.px;
  const row = (designWidth) => canvas.row(designWidth);
  // Keeps the design's bottom margin on any canvas height.
  const clusterTop = canvas.h - px(PANEL_BOTTOM_MARGIN) - px(LOGO_TO_PANEL_BOTTOM);

  const elements = [
    // =========================================================
    // BACKGROUND
    // =========================================================
    {
      type: 'html',
      html: `
        <div style="
          width:${canvas.w}px;
          height:${canvas.h}px;
          position:relative;
          overflow:hidden;
          background:#F8FAFC;
        ">

          <!-- Soft blue glow -->
          <div style="
            position:absolute;
            width:${px(760)}px;
            height:${px(760)}px;
            right:-${px(380)}px;
            top:-${px(260)}px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.07;
          "></div>

          <!-- Navy corner shape -->
          <div style="
            position:absolute;
            width:${px(460)}px;
            height:${px(460)}px;
            right:-${px(230)}px;
            top:${px(40)}px;
            border-radius:50%;
            background:#0F172A;
            opacity:0.96;
          "></div>

          <!-- Small blue accent -->
          <div style="
            position:absolute;
            width:${px(190)}px;
            height:${px(190)}px;
            left:-${px(95)}px;
            bottom:${px(280)}px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.07;
          "></div>

          <!-- Bottom glass panel, behind the trust line -->
          <div style="
            position:absolute;
            left:${px(55)}px;
            right:${px(55)}px;
            bottom:${px(PANEL_BOTTOM_MARGIN)}px;
            height:${px(230)}px;
            border-radius:${px(36)}px;
            background:rgba(255,255,255,0.86);
            border:1px solid rgba(15,23,42,0.06);
            box-shadow:0 ${px(20)}px ${px(60)}px rgba(15,23,42,0.08);
          "></div>

        </div>
      `,
      x: 0,
      y: 0,
      width: canvas.w,
      height: canvas.h,
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
    elements.push(fittedImage(brand.logo, {
      x: canvas.mid(px(480)),
      y: clusterTop + px(ROW.logo),
      width: px(480),
      height: px(270),
    }, { duration, fadeIn: 0.45 }));
  }

  // =========================================================
  // TOP BRAND LABEL
  // =========================================================

  if (brand.name) {
    const label = row(840);
    elements.push({
      type: 'text',
      text: brand.name.toUpperCase(),
      x: label.x,
      y: clusterTop + px(ROW.name),
      width: label.width,
      height: px(50),
      start: 0.15,
      duration: Math.max(0, duration - 0.15),
      settings: {
        'font-family': 'Montserrat',
        color: '#64748B',
        'font-size': `${px(22)}px`,
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
        width:${px(86)}px;
        height:${px(7)}px;
        border-radius:20px;
        background:${brandColor};
      "></div>
    `,
    x: canvas.mid(px(86)),
    y: clusterTop + px(ROW.rule),
    width: px(86),
    height: px(7),
    start: 0.25,
    duration: Math.max(0, duration - 0.25),
    'fade-in': 0.35,
  });

  // =========================================================
  // MAIN HEADLINE
  // =========================================================

  if (headline) {
    const headlineRow = row(940);
    elements.push({
      type: 'text',
      text: headline,
      x: headlineRow.x,
      y: clusterTop + px(ROW.headline),
      width: headlineRow.width,
      height: px(240),
      start: 0.35,
      duration: Math.max(0, duration - 0.35),
      settings: {
        'font-family': 'Montserrat',
        color: '#0F172A',
        'font-size': `${px(68)}px`,
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
    const subRow = row(860);
    elements.push({
      type: 'text',
      text: subtext,
      x: subRow.x,
      y: clusterTop + px(ROW.subtext),
      width: subRow.width,
      height: px(150),
      start: 0.55,
      duration: Math.max(0, duration - 0.55),
      settings: {
        'font-family': 'Montserrat',
        color: '#475569',
        'font-size': `${px(34)}px`,
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
        width:${px(430)}px;
        height:${px(105)}px;
        border-radius:${px(26)}px;
        background:${brandColor};
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 ${px(18)}px ${px(40)}px ${brandColor}30;
      ">
        <span style="
          color:#FFFFFF;
          font-family:Montserrat,sans-serif;
          font-size:${px(30)}px;
          font-weight:800;
          letter-spacing:0.4px;
        ">
          GET STARTED
        </span>
      </div>
    `,
    x: canvas.mid(px(430)),
    y: clusterTop + px(ROW.button),
    width: px(430),
    height: px(105),
    start: 0.7,
    duration: Math.max(0, duration - 0.7),
    'fade-in': 0.4,
  });

  // =========================================================
  // BOTTOM TRUST MESSAGE
  // =========================================================

  const trustRow = row(880);
  elements.push({
    type: 'text',
    text: 'PROFESSIONAL • TRUSTED • RELIABLE',
    x: trustRow.x,
    y: clusterTop + px(ROW.trust),
    width: trustRow.width,
    height: px(50),
    start: 0.9,
    duration: Math.max(0, duration - 0.9),
    settings: {
      'font-family': 'Montserrat',
      color: '#64748B',
      'font-size': `${px(19)}px`,
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
