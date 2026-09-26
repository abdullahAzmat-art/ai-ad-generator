// ─── Voiceover ────────────────────────────────────────────────────────────────
export function voiceover(text) {
  return {
    type: 'voice',
    text: text || '',
    voice: 'en-US-EmmaMultilingualNeural',
    duration: -2,
    volume: 1.5,
  };
}

// ─── Full-width bottom brand strip ────────────────────────────────────────────
// Spans the entire 1080px canvas width. Large logo, big brand name + website.
// Present on EVERY frame, legible on any background.
export function brandBar(brand, duration) {
  const initials = ((brand.name || 'B')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'B');

  const logoHtml = brand.logo
    ? `<img src="${brand.logo}" style="width:100%;height:100%;object-fit:contain;" />`
    : `<span style="font-family:Montserrat,sans-serif;font-size:34px;font-weight:900;color:#FFF;line-height:1;">${initials}</span>`;

  const strip = {
    type: 'html',
    html: `<div style="width:1080px;height:160px;background:rgba(255,255,255,0.97);border-top:5px solid ${brand.color};display:flex;align-items:center;justify-content:center;padding:0 40px;gap:28px;box-sizing:border-box;box-shadow:0 -6px 36px rgba(0,0,0,0.12);">
      <div style="width:110px;height:110px;border-radius:55px;background:${brand.logo ? '#F9FAFB' : brand.color};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;border:3px solid rgba(0,0,0,0.07);">
        ${logoHtml}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center;">
        <span style="font-family:Montserrat,sans-serif;font-size:64px;font-weight:900;color:#111827;letter-spacing:-1px;line-height:1.1;white-space:nowrap;">${brand.name || ''}</span>
        ${brand.website ? `<span style="font-family:Montserrat,sans-serif;font-size:36px;font-weight:600;color:${brand.color};white-space:nowrap;">${brand.website}</span>` : ''}
      </div>
    </div>`,
    x: 0,
    y: 1760,
    width: 1080,
    height: 160,
    start: 0,
    duration,
    'fade-in': 0.3,
  };

  return [strip];
}

// ─── QR code — top-right corner, every frame ──────────────────────────────────
export function qrCode(brand, duration) {
  const qrUrl = brand.website
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&data=https://${brand.website}`
    : null;

  if (!qrUrl) return [];

  return [
    {
      type: 'html',
      html: `<div style="
        background:#FFFFFF;
        border-radius:16px;
        padding:10px;
        box-shadow:0 4px 20px rgba(0,0,0,0.14);
        display:inline-block;
      ">
        <img src="${qrUrl}" style="width:130px;height:130px;display:block;" />
      </div>`,
      x: 900,
      y: 60,
      width: 150,
      height: 150,
      start: 0,
      duration,
      'fade-in': 0.3,
    },
  ];
}

// ─── Legacy brandSignature (kept for non-product templates) ───────────────────
export function brandSignature(brand, duration) {
  return [...brandBar(brand, duration), ...qrCode(brand, duration)];
}
