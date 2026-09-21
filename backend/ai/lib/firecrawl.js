import 'dotenv/config';
import Firecrawl from '@mendable/firecrawl-js';
import { filterGoodImages, resolveLogo } from './validateImages.js';

const DEFAULT_BRAND_COLOR = '#10B981';
const DROP_IMAGE_PATTERN = /sprite|icon|logo|favicon|badge|payment|pixel|tracking|placeholder|\.svg|\.gif|data:image/i;

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function getImageUrl(image) {
  return typeof image === 'string' ? image : image?.url;
}

function hasSmallWidthParam(url) {
  try {
    const parsed = new URL(url);
    const width = parsed.searchParams.get('width') ?? parsed.searchParams.get('w');
    return width !== null && Number(width) < 200;
  } catch {
    return false;
  }
}

export async function scrapeUrl(url) {
  if (!isValidHttpUrl(url)) throw new Error('scrapeUrl requires a valid http(s) URL.');
  if (!process.env.FIRECRAWL_API_KEY) throw new Error('FIRECRAWL_API_KEY is not configured.');

  try {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const result = await firecrawl.scrape(url, {
      formats: ['markdown', 'images', 'branding'],
      onlyMainContent: true,
      waitFor: 1500,
      maxAge: 86400000,
      timeout: 60000,
    });
    const metadata = result?.metadata ?? {};
    const branding = result?.branding ?? {};

    if (process.env.DEBUG_SCRAPE === '1') console.log('Raw branding:', branding);

    const allImageUrls = (result?.images ?? []).map(getImageUrl).filter(Boolean);
    const candidateImages = [metadata.ogImage, ...allImageUrls]
      .filter(Boolean)
      .filter((image, index, values) => values.indexOf(image) === index)
      .filter((image) => !DROP_IMAGE_PATTERN.test(image) && !hasSmallWidthParam(image))
      .slice(0, 12);

    return {
      title: metadata.ogTitle || metadata.title || '',
      description: metadata.ogDescription || metadata.description || '',
      pageText: (result?.markdown || '').trim().slice(0, 4000),
      images: await filterGoodImages(candidateImages),
      logo: await resolveLogo(branding, allImageUrls),
      brandColor: /^#[0-9A-F]{6}$/i.test(branding?.colors?.primary)
        ? branding.colors.primary
        : DEFAULT_BRAND_COLOR,
    };
  } catch (error) {
    throw new Error(`Firecrawl scrape failed: ${error.message}`, { cause: error });
  }
}