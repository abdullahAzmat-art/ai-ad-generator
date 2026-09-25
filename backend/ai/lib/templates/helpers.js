export function voiceover(text) {
  return {
    type: 'voice',
    text: text || '',
    voice: 'en-US-EmmaMultilingualNeural',
    duration: -2,
    volume: 1.5,
  };
}

export function brandSignature(brand, duration) {
  const initials = ((brand.name || 'B')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'B');
  const mark = {
    type: 'html',
    html: `<div style="width:96px;height:96px;border-radius:48px;background:${brand.color};color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;font-size:32px;font-weight:800;letter-spacing:1px;box-shadow:0 0 0 4px rgba(17,24,39,0.05);">${initials}</div>`,
    x: 56,
    y: 1678,
    width: 96,
    height: 96,
    start: 0.15,
    duration,
    'fade-in': 0.25,
  };

  if (brand.logo) {
    mark.type = 'html';
    mark.html = `<div style="width:120px;height:120px;border-radius:60px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(17,24,39,0.1);overflow:hidden;"><img src="${brand.logo}" style="width:100%;height:100%;object-fit:contain;" /></div>`;
    delete mark.src;
    delete mark.resize;
  }

  const textX = 196;

  return [
    {
      type: 'html',
      html: '<div style="width:850px;height:1px;background:#E5E7EB;"></div>',
      x: 56,
      y: 1630,
      width: 850,
      height: 1,
      start: 0.15,
      duration,
    },
    mark,
    {
      type: 'text',
      text: brand.name,
      x: textX,
      y: 1682,
      width: 660,
      height: 54,
      start: 0.15,
      duration,
      settings: {
        'font-family': 'Montserrat',
        color: '#111827',
        'font-size': '42px',
        'font-weight': '800',
        'text-align': 'left',
      },
      'fade-in': 0.25,
    },
    ...(brand.website ? [{
      type: 'text',
      text: brand.website,
      x: textX,
      y: 1744,
      width: 660,
      height: 38,
      start: 0.2,
      duration,
      settings: {
        'font-family': 'Montserrat',
        color: '#4B5563',
        'font-size': '28px',
        'font-weight': '600',
        'text-align': 'left',
      },
      'fade-in': 0.25,
    }] : []),
  ];
}
