import 'dotenv/config';
import Firecrawl from '@mendable/firecrawl-js';
import { filterGoodImages, resolveLogo } from './validateImages.js';

const DEFAULT_BRAND_COLOR = '#10B981';
const DROP_IMAGE_PATTERN = /sprite|icon|logo|favicon|badge|payment|pixel|tracking|placeholder|\.svg|\.gif/i;
const DEBUG = process.env.DEBUG_SCRAPE === '1';

/**
 * How many discovered URLs get probed, and how many survivors travel onward.
 * The probe pool is deliberately wide: cutting the list before validation kept
 * nav and footer chrome and never reached the product photos further down the
 * page. The survivor cap stays low because every image is sent to the vision
 * model during classification.
 */
const MAX_IMAGE_PROBES = 60;
const MAX_FINAL_IMAGES = 12;

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
    return DROP_IMAGE_PATTERN.test(new URL(url).pathname);
  } catch {
    return DROP_IMAGE_PATTERN.test(url);
  }
}

/**
 * FIX #3: embedded `data:image/...` URIs must be dropped too. They are common They are common
 * in the images list (inlined tracking pixels and tiny placeholders) and the
 * path-only check above can never see them, since a data URI has no hostname
 * and its scheme is stripped from the pathname. Requiring an absolute http(s)
 * URL removes them before they eat probe slots and fail the byte read.
 */
function isUsableImage(url) {
  if (!isValidHttpUrl(url)) return false;
  return !shouldDropImage(url) && !hasSmallWidthParam(url);
}

/**
 * Some sites hand back root-relative or relative image paths ("/cdn/...").
 * Resolve them against the scraped page so the validator gets a fetchable URL
 * instead of throwing on every candidate.
 */
function absolutizeImages(urls, baseUrl) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    return urls;
  }
  return urls.map((image) => {
    if (!image || image.startsWith('data:')) return image;
    try {
      return new URL(image, base).href;
    } catch {
      return image;
    }
  });
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

    const allImageUrls = absolutizeImages(
      (result?.images ?? []).map(getImageUrl).filter(Boolean),
      metadata.sourceUrl || url
    ).filter(Boolean);
    if (DEBUG) console.log('[scrapeUrl] raw images from Firecrawl:', allImageUrls.length, allImageUrls);

    const candidateImages = [metadata.ogImage, ...allImageUrls]
      .filter(Boolean)
      .filter((image, index, values) => values.indexOf(image) === index)
      .filter(isUsableImage)
      .slice(0, MAX_IMAGE_PROBES);
    if (DEBUG) console.log('[scrapeUrl] candidateImages after filtering:', candidateImages.length, candidateImages);

    // Probing stops as soon as MAX_FINAL_IMAGES survivors are found, so a page
    // with a slow CDN doesn't spend minutes downloading every candidate.
    const goodImages = await filterGoodImages(candidateImages, { limit: MAX_FINAL_IMAGES });

    console.log(
      `[Scrape] images: Firecrawl found ${allImageUrls.length}, ` +
      `${candidateImages.length} passed the name filter, ${goodImages.length} usable.`
    );
    if (DEBUG) console.log('[scrapeUrl] final images:', goodImages);
    if (allImageUrls.length > 0 && goodImages.length === 0) {
      console.warn('[Scrape] No scraped image survived validation — the ad would fall back to stock. Re-run with DEBUG_SCRAPE=1 to see why each URL was dropped.');
    }

    return {
      title: metadata.ogTitle || metadata.title || '',
      description: metadata.ogDescription || metadata.description || '',
      pageText: (result?.markdown || '').trim().slice(0, 4000),
      images: goodImages,
      // ogImage is included because sites whose only logo asset is served as
      // their social card (e.g. ".../logo-seo.jpg") otherwise resolve to a
      // favicon; resolveLogo still only takes URLs that read as a logo.
      logo: await resolveLogo(branding, [metadata.ogImage, ...allImageUrls].filter(Boolean)),
      brandColor: /^#[0-9A-F]{6}$/i.test(branding?.colors?.primary)
        ? branding.colors.primary
        : DEFAULT_BRAND_COLOR,
    };
  } catch (error) {
    throw new Error(`Firecrawl scrape failed: ${error.message}`, { cause: error });
  }
}