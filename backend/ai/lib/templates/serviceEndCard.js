import { voiceover } from './helpers.js';

export function serviceEndCard(scene, brand) {
  const duration = scene.durationSec || 4;

  const phone = (brand.contact || '').trim();
  const website = (brand.website || '').trim();
  const brandName = (brand.name || '').trim();

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

          <!-- Large soft blue glow -->
          <div style="
            position:absolute;
            width:850px;
            height:850px;
            right:-420px;
            top:-280px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.07;
          "></div>

          <!-- Navy decorative circle -->
          <div style="
            position:absolute;
            width:500px;
            height:500px;
            right:-250px;
            top:80px;
            border-radius:50%;
            background:#0F172A;
          "></div>

          <!-- Small accent circle -->
          <div style="
            position:absolute;
            width:160px;
            height:160px;
            left:-80px;
            top:780px;
            border-radius:50%;
            background:${brandColor};
            opacity:0.08;
          "></div>

          <!-- Main information card -->
          <div style="
            position:absolute;
            left:55px;
            right:55px;
            top:1010px;
            height:570px;
            border-radius:42px;
            background:#FFFFFF;
            border:1px solid rgba(15,23,42,0.06);
            box-shadow:0 25px 70px rgba(15,23,42,0.09);
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
      x: 315,
      y: 330,
      width: 450,
      height: 260,
      resize: 'contain',
      start: 0,
      duration,
      'fade-in': 0.45,
    });
  }

  // =========================================================
  // BRAND NAME
  // =========================================================

  if (brandName) {
    elements.push({
      type: 'text',
      text: brandName.toUpperCase(),
      x: 100,
      y: 640,
      width: 880,
      height: 60,
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
        width:90px;
        height:7px;
        border-radius:20px;
        background:${brandColor};
      "></div>
    `,
    x: 495,
    y: 725,
    width: 90,
    height: 7,
    start: 0.2,
    duration: Math.max(0, duration - 0.2),
    'fade-in': 0.3,
  });

  // =========================================================
  // CTA HEADLINE
  // =========================================================

  elements.push({
    type: 'text',
    text: 'READY TO GET STARTED?',
    x: 70,
    y: 790,
    width: 940,
    height: 120,
    start: 0.3,
    duration: Math.max(0, duration - 0.3),
    settings: {
      'font-family': 'Montserrat',
      color: '#0F172A',
      'font-size': '58px',
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
        width:430px;
        height:100px;
        border-radius:25px;
        background:${brandColor};
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 18px 42px ${brandColor}30;
      ">
        <span style="
          color:#FFFFFF;
          font-family:Montserrat,sans-serif;
          font-size:30px;
          font-weight:900;
          letter-spacing:0.4px;
        ">
          CONTACT US
        </span>
      </div>
    `,
    x: 325,
    y: 970,
    width: 430,
    height: 100,
    start: 0.45,
    duration: Math.max(0, duration - 0.45),
    'fade-in': 0.4,
  });

  // =========================================================
  // PHONE
  // =========================================================

  if (phone) {
    elements.push({
      type: 'text',
      text: phone,
      x: 100,
      y: 1115,
      width: 880,
      height: 90,
      start: 0.6,
      duration: Math.max(0, duration - 0.6),
      settings: {
        'font-family': 'Montserrat',
        color: '#0F172A',
        'font-size': '48px',
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
    elements.push({
      type: 'text',
      text: website,
      x: 100,
      y: 1235,
      width: 880,
      height: 70,
      start: 0.75,
      duration: Math.max(0, duration - 0.75),
      settings: {
        'font-family': 'Montserrat',
        color: brandColor,
        'font-size': '34px',
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
        width:620px;
        height:1px;
        background:#E2E8F0;
      "></div>
    `,
    x: 230,
    y: 1350,
    width: 620,
    height: 1,
    start: 0.85,
    duration: Math.max(0, duration - 0.85),
    'fade-in': 0.25,
  });

  // =========================================================
  // TRUST TEXT
  // =========================================================

  elements.push({
    type: 'text',
    text: 'PROFESSIONAL • TRUSTED • RELIABLE',
    x: 100,
    y: 1400,
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
    elements.push({
      type: 'image',
      src: brand.qrCode,
      x: 870,
      y: 90,
      width: 130,
      height: 130,
      resize: 'contain',
      start: 0.4,
      duration: Math.max(0, duration - 0.4),
      'fade-in': 0.35,
    });
  }

  // =========================================================
  // FOOTER BRAND
  // =========================================================

  if (brandName) {
    elements.push({
      type: 'text',
      text: brandName,
      x: 100,
      y: 1660,
      width: 880,
      height: 70,
      start: 1,
      duration: Math.max(0, duration - 1),
      settings: {
        'font-family': 'Montserrat',
        color: '#0F172A',
        'font-size': '30px',
        'font-weight': '800',
        'text-align': 'center',
      },
      'fade-in': 0.3,
    });
  }

  // =========================================================
  // FINAL FOOTER
  // =========================================================

  elements.push({
    type: 'text',
    text: 'YOUR BUSINESS. YOUR NEXT CUSTOMER.',
    x: 100,
    y: 1730,
    width: 880,
    height: 50,
    start: 1.05,
    duration: Math.max(0, duration - 1.05),
    settings: {
      'font-family': 'Montserrat',
      color: '#94A3B8',
      'font-size': '18px',
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