import 'dotenv/config';
import Firecrawl from '@mendable/firecrawl-js';
import { filterGoodImages, resolveLogo } from './validateImages.js';

const DEFAULT_BRAND_COLOR = '#10B981';
const DROP_IMAGE_PATTERN = /sprite|icon|logo|favicon|badge|payment|pixel|tracking|placeholder|\.svg|\.gif|data:image/i;
const DEBUG = process.env.DEBUG_SCRAPE === '1';

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

/**
 * FIX #2: only test the PATH (e.g. "/assets/hero-banner.jpg"), not the full
 * URL. Before, `DROP_IMAGE_PATTERN.test(fullUrl)` also matched against the
 * domain — so a real product photo hosted on something like
 * "cdn.brandicon.com/photo.jpg" or served from a "/badge-collection/" path
 * got silently dropped even though the actual filename was fine. Testing
 * just the pathname keeps the intent (drop actual icon/logo/sprite files)
 * without nuking every image from a domain that happens to contain one of
 * these words.
 */
function shouldDropImage(url) {
  try {
    const { pathname } = new URL(url);
    return DROP_IMAGE_PATTERN.test(pathname);
  } catch {
    return DROP_IMAGE_PATTERN.test(url);
  }
}

export async function scrapeUrl(url) {
  if (!isValidHttpUrl(url)) throw new Error('scrapeUrl requires a valid http(s) URL.');
  if (!process.env.FIRECRAWL_API_KEY) throw new Error('FIRECRAWL_API_KEY is not configured.');

  try {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const result = await firecrawl.scrape(url, {
      formats: ['markdown', 'images', 'branding'],
      // FIX #1: onlyMainContent strips anything Firecrawl classifies as
      // boilerplate (nav, header, footer) before extracting each format —
      // including "images". Hero banners, product carousels, and gallery
      // sections are frequently classified as boilerplate on e-commerce/
      // landing-page sites, so the images format was scanning a much
      // smaller region of the page than the full DOM. Scanning the whole
      // page also picks up contact info that often lives in the footer,
      // which helps contactBusinessInformation too.
      onlyMainContent: false,
      waitFor: 1500,
      maxAge: 86400000,
      timeout: 60000,
    });
    const metadata = result?.metadata ?? {};
    const branding = result?.branding ?? {};

    if (DEBUG) console.log('Raw branding:', branding);

    const allImageUrls = (result?.images ?? []).map(getImageUrl).filter(Boolean);
    if (DEBUG) console.log('[scrapeUrl] raw images from Firecrawl:', allImageUrls.length, allImageUrls);

    const candidateImages = [metadata.ogImage, ...allImageUrls]
      .filter(Boolean)
      .filter((image, index, values) => values.indexOf(image) === index)
      .filter((image) => !shouldDropImage(image) && !hasSmallWidthParam(image))
      .slice(0, 12);
    if (DEBUG) console.log('[scrapeUrl] candidateImages after filtering:', candidateImages.length, candidateImages);

    const goodImages = await filterGoodImages(candidateImages);
    if (DEBUG) console.log('[scrapeUrl] final images after filterGoodImages:', goodImages.length, goodImages);

    return {
      title: metadata.ogTitle || metadata.title || '',
      description: metadata.ogDescription || metadata.description || '',
      pageText: (result?.markdown || '').trim().slice(0, 4000),
      images: goodImages,
      logo: await resolveLogo(branding, allImageUrls),
      brandColor: /^#[0-9A-F]{6}$/i.test(branding?.colors?.primary)
        ? branding.colors.primary
        : DEFAULT_BRAND_COLOR,
    };
  } catch (error) {
    throw new Error(`Firecrawl scrape failed: ${error.message}`, { cause: error });
  }
}