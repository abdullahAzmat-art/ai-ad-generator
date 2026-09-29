import { createCanvas } from '../canvas.js';

// ─── Scene copy is user-editable, so anything landing inside an `html` element
// has to be escaped or the text can close its own tag and inject markup.
// ────────────────────────────────────────────────────────────────────────────
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// ─── Aspect-ratio-safe image fitting ─────────────────────────────────────────
// Templates run without knowing each source photo's native size, and JSON2Video
// `resize:"cover"` crops whatever overflows the frame — mild at 9:16, brutal on
// 16:9 and 1:1 where a vertical photo loses its top/bottom or sides. CSS
// object-fit resolves any source ratio by construction, so the whole image
// always shows. `fittedPhoto` pairs a sharp `contain` foreground with the same
// photo blurred and covering behind it, so the leftover bars read as designed
// fill instead of empty letterboxing. `fittedImage` fits one image inside an
// arbitrary box (logo marks, side panels) with the same no-crop guarantee.
//
// The root div MUST use explicit pixel dimensions, not 100%: JSON2Video's html
// element doesn't give the content viewport a definite height, so a
// height:100% chain collapses to the image's natural height and the picture
// pins to the top of the frame with the rest of the box empty. Explicit px
// (same as brandBar and every other proven element here) sizes it correctly.
// ─────────────────────────────────────────────────────────────────────────────
export function fittedPhoto(imageUrl, canvas, opts = {}) {
  const { w, h } = canvas;
  const blur = canvas.px(48);
  return [
    {
      type: 'html',
      html: `<div style="width:${w}px;height:${h}px;overflow:hidden;"><img src="${escapeHtml(imageUrl)}" style="width:100%;height:100%;object-fit:cover;filter:blur(${blur}px);transform:scale(1.2);" /></div>`,
      x: 0,
      y: 0,
      width: w,
      height: h,
      start: 0,
      duration: opts.duration,
    },
    {
      type: 'html',
      html: `<div style="width:${w}px;height:${h}px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><img src="${escapeHtml(imageUrl)}" style="width:100%;height:100%;object-fit:contain;object-position:center;" /></div>`,
      x: 0,
      y: 0,
      width: w,
      height: h,
      start: 0,
      duration: opts.duration,
      ...(opts.fadeIn ? { 'fade-in': opts.fadeIn } : {}),
    },
  ];
}

export function fittedImage(imageUrl, box, opts = {}) {
  const { x, y, width, height } = box;
  return {
    type: 'html',
    html: `<div style="width:${width}px;height:${height}px;overflow:hidden;display:flex;align-items:center;justify-content:center;"><img src="${escapeHtml(imageUrl)}" style="width:100%;height:100%;object-fit:contain;object-position:${opts.position || 'center'};" /></div>`,
    x, y, width, height,
    start: opts.start ?? 0,
    duration: opts.duration,
    ...(opts.fadeIn ? { 'fade-in': opts.fadeIn } : {}),
  };
}

// ─── Full-width bottom brand strip ────────────────────────────────────────────
// Spans the entire canvas width and rests on its bottom edge. Large logo, big
// brand name + website. Present on EVERY frame, legible on any background.
export function brandBar(brand, duration, canvas = createCanvas()) {
  const initials = ((brand.name || 'B')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'B');

  const logoSize = canvas.px(110);
  const logoHtml = brand.logo
    ? `<img src="${escapeHtml(brand.logo)}" style="width:100%;height:100%;object-fit:contain;" />`
    : `<span style="font-family:Montserrat,sans-serif;font-size:${canvas.px(34)}px;font-weight:900;color:#FFF;line-height:1;">${initials}</span>`;

  const strip = {
    type: 'html',
    html: `<div style="width:${canvas.w}px;height:${canvas.barH}px;background:rgba(255,255,255,0.97);border-top:${canvas.px(5)}px solid ${brand.color};display:flex;align-items:center;justify-content:center;padding:0 ${canvas.px(40)}px;gap:${canvas.px(28)}px;box-sizing:border-box;box-shadow:0 ${canvas.px(-6)}px ${canvas.px(36)}px rgba(0,0,0,0.12);">
      <div style="width:${logoSize}px;height:${logoSize}px;border-radius:${Math.round(logoSize / 2)}px;background:${brand.logo ? '#F9FAFB' : brand.color};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;border:${canvas.px(3)}px solid rgba(0,0,0,0.07);">
        ${logoHtml}
      </div>
      <div style="display:flex;flex-direction:column;gap:${canvas.px(6)}px;align-items:center;text-align:center;">
        <span style="font-family:Montserrat,sans-serif;font-size:${canvas.px(64)}px;font-weight:900;color:#111827;letter-spacing:-1px;line-height:1.1;white-space:nowrap;">${escapeHtml(brand.name || '')}</span>
        ${brand.website ? `<span style="font-family:Montserrat,sans-serif;font-size:${canvas.px(36)}px;font-weight:600;color:${brand.color};white-space:nowrap;">${escapeHtml(brand.website)}</span>` : ''}
      </div>
    </div>`,
    x: 0,
    y: canvas.h - canvas.barH,
    width: canvas.w,
    height: canvas.barH,
    start: 0,
    duration,
    'fade-in': 0.3,
  };

  return [strip];
}

// ─── QR code — top-right corner, every frame ──────────────────────────────────
export function qrCode(brand, duration, canvas = createCanvas()) {
  const qrUrl = brand.website
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&data=https://${brand.website}`
    : null;

  if (!qrUrl) return [];

  const size = canvas.px(150);
  const margin = canvas.px(60);

  return [
    {
      type: 'html',
      html: `<div style="
        background:#FFFFFF;
        border-radius:${canvas.px(16)}px;
        padding:${canvas.px(10)}px;
        box-shadow:0 ${canvas.px(4)}px ${canvas.px(20)}px rgba(0,0,0,0.14);
        display:inline-block;
      ">
        <img src="${qrUrl}" style="width:${canvas.px(130)}px;height:${canvas.px(130)}px;display:block;" />
      </div>`,
      x: canvas.w - size - margin,
      y: margin,
      width: size,
      height: size,
      start: 0,
      duration,
      'fade-in': 0.3,
    },
  ];
}

// ─── Legacy brandSignature (kept for non-product templates) ───────────────────
export function brandSignature(brand, duration, canvas = createCanvas()) {
  return [...brandBar(brand, duration, canvas), ...qrCode(brand, duration, canvas)];
}
