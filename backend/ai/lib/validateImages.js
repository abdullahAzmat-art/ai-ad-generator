import { imageSize } from 'image-size';

const FETCH_TIMEOUT_MS = 5000;

async function fetchImage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-65535' },
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Image request returned ${response.status}`);
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.startsWith('image/')) throw new Error('Response is not an image');

    const bytes = new Uint8Array(await response.arrayBuffer());
    return { contentType, bytes };
  } finally {
    clearTimeout(timeout);
  }
}

function hasGoodDimensions(bytes, minShortSide, minRatio, maxRatio) {
  const { width, height } = imageSize(bytes);
  if (!width || !height) return false;

  const ratio = width / height;
  return Math.min(width, height) >= minShortSide && ratio >= minRatio && ratio <= maxRatio;
}

export async function filterGoodImages(urls) {
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const { bytes } = await fetchImage(url);
      return hasGoodDimensions(bytes, 600, 0.4, 2.5) ? url : null;
    } catch {
      return null;
    }
  }));

  return results.filter(Boolean);
}

export async function resolveLogo(branding, images) {
  const candidates = [
    branding?.logo,
    branding?.images?.logo,
    ...images.filter((url) => url.toLowerCase().includes('logo')),
    branding?.images?.favicon,
  ]
    .map((candidate) => (typeof candidate === 'string' ? candidate : candidate?.url))
    .filter(Boolean)
    .filter((url, index, values) => values.indexOf(url) === index);

  for (const url of candidates) {
    try {
      const { contentType, bytes } = await fetchImage(url);
      if (contentType.includes('svg')) return url;
      if (hasGoodDimensions(bytes, 128, 0.2, 6)) return url;
    } catch {
      continue;
    }
  }

  return null;
}