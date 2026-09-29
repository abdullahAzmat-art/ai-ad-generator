import { createCanvas } from '../canvas.js';
import { voiceover, fittedImage } from './helpers.js';

// Distances from the top of the closing composition, measured on the
// 1080x1920 story frame. The cluster hangs from its bottom margin, so a square
// or landscape canvas gets the same card with tighter air around it.
const ROW = {
  logo: 0,
  name: 310,
  rule: 395,
  headline: 460,
  button: 640,
  card: 680,
  phone: 785,
  website: 905,
  divider: 1020,
  trust: 1070,
  brand: 1330,
  footer: 1400,
};
const LOGO_TO_FOOTER_BOTTOM = 1450;
const BOTTOM_MARGIN = 140;
const CARD_HEIGHT = 570;
const SIDE_INSET = 55;

export function serviceEndCard(scene, brand, canvas = createCanvas()) {
  const duration = scene.durationSec || 4;

  const phone = (brand.contact || '').trim();
  const website = (brand.website || '').trim();
  const brandName = (brand.name || '').trim();

  const brandColor = brand.color || '#2563EB';

  const px = canvas.px;
  const row = (designWidth) => canvas.row(designWidth);
  const clusterTop = canvas.h - px(BOTTOM_MARGIN) - px(LOGO_TO_FOOTER_BOTTOM);
  const cardTop = clusterTop + px(ROW.card);
  const cardInset = px(SIDE_INSET);

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

          <!-- Large soft blue glow -->
          <div style="
            position:absolute;
            width:${px(850)}px;
            height:${px(850)}px;
            right:-${px(420)}px;
            top:-${px(280)}px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.07;
          "></div>

          <!-- Navy decorative circle -->
          <div style="
            position:absolute;
            width:${px(500)}px;
            height:${px(500)}px;
            right:-${px(250)}px;
            top:${px(80)}px;
            border-radius:50%;
            background:#0F172A;
          "></div>

          <!-- Small accent circle -->
          <div style="
            position:absolute;
            width:${px(160)}px;
            height:${px(160)}px;
            left:-${px(80)}px;
            top:${px(780)}px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.08;
          "></div>

          <!-- Main information card -->
          <div style="
            position:absolute;
            left:${cardInset}px;
            right:${cardInset}px;
            top:${cardTop}px;
            height:${px(CARD_HEIGHT)}px;
            border-radius:${px(42)}px;
            background:#FFFFFF;
            border:1px solid rgba(15,23,42,0.06);
            box-shadow:0 ${px(25)}px ${px(70)}px rgba(15,23,42,0.09);
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
      x: canvas.mid(px(450)),
      y: clusterTop + px(ROW.logo),
      width: px(450),
      height: px(260),
    }, { duration, fadeIn: 0.45 }));
  }

  // =========================================================
  // BRAND NAME
  // =========================================================

  if (brandName) {
    const nameRow = row(880);
    elements.push({
      type: 'text',
      text: brandName.toUpperCase(),
      x: nameRow.x,
      y: clusterTop + px(ROW.name),
      width: nameRow.width,
      height: px(60),
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
        width:${px(90)}px;
        height:${px(7)}px;
        border-radius:20px;
        background:${brandColor};
      "></div>
    `,
    x: canvas.mid(px(90)),
    y: clusterTop + px(ROW.rule),
    width: px(90),
    height: px(7),
    start: 0.2,
    duration: Math.max(0, duration - 0.2),
    'fade-in': 0.3,
  });

  // =========================================================
  // CTA HEADLINE
  // =========================================================

  const headlineRow = row(940);
  elements.push({
    type: 'text',
    text: 'READY TO GET STARTED?',
    x: headlineRow.x,
    y: clusterTop + px(ROW.headline),
    width: headlineRow.width,
    height: px(120),
    start: 0.3,
    duration: Math.max(0, duration - 0.3),
    settings: {
      'font-family': 'Montserrat',
      color: '#0F172A',
      'font-size': `${px(58)}px`,
      'font-weight': '900',
      'text-align': 'center',
      'letter-spacing': '-1.2px',
    },
    'fade-in': 0.4,
  });

  // =========================================================
  // CONTACT BUTTON
  // =========================================================

  elements.push({
    type: 'html',
    html: `
      <div style="
        width:${px(430)}px;
        height:${px(100)}px;
        border-radius:${px(25)}px;
        background:${brandColor};
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 ${px(18)}px ${px(42)}px ${brandColor}30;
      ">
        <span style="
          color:#FFFFFF;
          font-family:Montserrat,sans-serif;
          font-size:${px(30)}px;
          font-weight:900;
          letter-spacing:0.4px;
        ">
          CONTACT US
        </span>
      </div>
    `,
    x: canvas.mid(px(430)),
    y: clusterTop + px(ROW.button),
    width: px(430),
    height: px(100),
    start: 0.45,
    duration: Math.max(0, duration - 0.45),
    'fade-in': 0.4,
  });

  // =========================================================
  // PHONE
  // =========================================================

  if (phone) {
    const phoneRow = row(880);
    elements.push({
      type: 'text',
      text: phone,
      x: phoneRow.x,
      y: clusterTop + px(ROW.phone),
      width: phoneRow.width,
      height: px(90),
      start: 0.6,
      duration: Math.max(0, duration - 0.6),
      settings: {
        'font-family': 'Montserrat',
        color: '#0F172A',
        'font-size': `${px(48)}px`,
        'font-weight': '800',
        'text-align': 'center',
        'letter-spacing': '-0.5px',
      },
      'fade-in': 0.35,
    });
  }

  // =========================================================
  // WEBSITE
  // =========================================================

  if (website) {
    const websiteRow = row(880);
    elements.push({
      type: 'text',
      text: website,
      x: websiteRow.x,
      y: clusterTop + px(ROW.website),
      width: websiteRow.width,
      height: px(70),
      start: 0.75,
      duration: Math.max(0, duration - 0.75),
      settings: {
        'font-family': 'Montserrat',
        color: brandColor,
        'font-size': `${px(34)}px`,
        'font-weight': '700',
        'text-align': 'center',
      },
      'fade-in': 0.35,
    });
  }

  // =========================================================
  // DIVIDER
  // =========================================================

  elements.push({
    type: 'html',
    html: `
      <div style="
        width:${px(620)}px;
        height:1px;
        background:#E2E8F0;
      "></div>
    `,
    x: canvas.mid(px(620)),
    y: clusterTop + px(ROW.divider),
    width: px(620),
    height: 1,
    start: 0.85,
    duration: Math.max(0, duration - 0.85),
    'fade-in': 0.25,
  });

  // =========================================================
  // TRUST TEXT
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
      'letter-spacing': '1.4px',
    },
    'fade-in': 0.3,
  });

  // =========================================================
  // QR CODE
  // =========================================================
  //
  // If your brand object contains a QR image, this will display it.
  //
  if (brand.qrCode) {
    elements.push(fittedImage(brand.qrCode, {
      x: canvas.w - px(130) - px(80),
      y: px(90),
      width: px(130),
      height: px(130),
    }, { start: 0.4, duration: Math.max(0, duration - 0.4), fadeIn: 0.35 }));
  }

  // =========================================================
  // FOOTER BRAND
  // =========================================================

  if (brandName) {
    const footerRow = row(880);
    elements.push({
      type: 'text',
      text: brandName,
      x: footerRow.x,
      y: clusterTop + px(ROW.brand),
      width: footerRow.width,
      height: px(70),
      start: 1,
      duration: Math.max(0, duration - 1),
      settings: {
        'font-family': 'Montserrat',
        color: '#0F172A',
        'font-size': `${px(30)}px`,
        'font-weight': '800',
        'text-align': 'center',
      },
      'fade-in': 0.3,
    });
  }

  // =========================================================
  // FINAL FOOTER
  // =========================================================

  const closingRow = row(880);
  elements.push({
    type: 'text',
    text: 'YOUR BUSINESS. YOUR NEXT CUSTOMER.',
    x: closingRow.x,
    y: clusterTop + px(ROW.footer),
    width: closingRow.width,
    height: px(50),
    start: 1.05,
    duration: Math.max(0, duration - 1.05),
    settings: {
      'font-family': 'Montserrat',
      color: '#94A3B8',
      'font-size': `${px(18)}px`,
      'font-weight': '600',
      'text-align': 'center',
      'letter-spacing': '1.2px',
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
