// Canned pipeline data for USE_MOCK_DATA=1.
// Lets the full LangGraph workflow — including the JSON2Video render node —
// run without Firecrawl, LLM, or Pexels spend. Every scene here satisfies
// reviewNode's rules so a mock run always reaches render.

const BRAND = {
  name: 'Aurelle',
  tagline: 'Wear the moment',
  color: '#C9A24B',
  website: 'aurelle.example.com',
};

const LOGO_URL = 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80'; // Clean minimalistic logo-style image
const PRODUCT_HERO_URL = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80'; // Beautiful perfume bottle
const PRODUCT_ALT_URL = 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80'; // Alternate perfume bottle
const PRODUCT_BACK_URL = 'https://images.unsplash.com/photo-1595425970377-c9703c486578?w=800&q=80'; // Third perfume bottle

function toFormat(aspectRatio) {
  if (aspectRatio === '16:9') return 'banner';
  if (aspectRatio === '1:1') return 'square';
  return 'story';
}

const clone = (value) => JSON.parse(JSON.stringify(value));

export function mockScraped() {
  return clone({
    pageInformation: {
      title: 'Aurelle — Signature Fragrances',
      description: 'Hand-blended luxury perfumes crafted in small batches.',
      text: 'Aurelle No. 9 is our signature eau de parfum. Rare oud, warm amber, and a twelve-hour dry down. Free shipping this week only.',
    },
    brandInformation: {
      name: BRAND.name,
      missionOrTagline: BRAND.tagline,
    },
    productInformation: {
      mainProductOrService: 'Aurelle No. 9 Eau de Parfum',
      keyFeatures: ['Rare oud and warm amber', 'Twelve-hour longevity', 'Hand-blended in small batches'],
      targetAudience: 'Professionals who wear fragrance daily',
      pricingOrOffers: 'Free shipping this week only',
    },
    images: [LOGO_URL, PRODUCT_HERO_URL, PRODUCT_ALT_URL, PRODUCT_BACK_URL],
    logo: LOGO_URL,
    colors: [BRAND.color],
    fonts: ['Montserrat'],
    ctaHints: ['Shop Now'],
    contactBusinessInformation: {
      email: 'hello@aurelle.example.com',
      phone: '+1 555 014 8899',
    },
    title: 'Aurelle — Signature Fragrances',
    description: 'Hand-blended luxury perfumes crafted in small batches.',
    pageText: 'Aurelle No. 9 is our signature eau de parfum. Rare oud, warm amber, and a twelve-hour dry down.',
    brandColor: BRAND.color,
  });
}

export function mockAssets() {
  return clone({
    logo: LOGO_URL,
    productHero: PRODUCT_HERO_URL,
    productSecondary: [PRODUCT_ALT_URL, PRODUCT_BACK_URL],
    lifestyle: [],
    person: [],
    office: [],
    food: [],
    background: [],
  });
}

export function mockAdType() {
  return 'product';
}

// missingAssets is intentionally empty so routeImages skips the Pexels node.
export function mockBlueprint() {
  return clone([
    { role: 'hook', purpose: 'Introduce the hero product with a clean white packshot', durationSec: 4, assetTypeNeeded: 'productHero' },
    { role: 'product-hero', purpose: 'Reveal the second product angle and its craft', durationSec: 4, assetTypeNeeded: 'productSecondary' },
    { role: 'benefits', purpose: 'Lead with the longevity benefit over another packshot', durationSec: 4, assetTypeNeeded: 'productSecondary' },
    { role: 'cta', purpose: 'Close on a white branded end card with contact details', durationSec: 3, assetTypeNeeded: 'productHero' },
  ]);
}

// Scenes mirror mockBlueprint roles exactly and obey reviewNode limits:
// headline ≤8 words, subtext ≤12, voiceover ≤2.5 words/s × durationSec,
// durationSec 2–6, total 15s (8–20), CTA only on the final scene.
export function mockScript(aspectRatio = '9:16') {
  return clone({
    scenes: [
      {
        role: 'hook',
        layout: 'product-right',
        assetRole: 'productHero',
        headline: 'Meet Your Signature Scent',
        subtext: 'Crafted for unforgettable evenings',
        cta: '',
        voiceover: 'Meet the fragrance that turns every moment golden.',
        durationSec: 4,
        animation: 'product-reveal',
      },
      {
        role: 'product-hero',
        layout: 'product-right',
        assetRole: 'productSecondary',
        headline: 'Rare Oud, Warm Amber',
        subtext: 'Hand-blended in small batches',
        cta: '',
        voiceover: 'Rare oud and warm amber, hand-blended in small batches.',
        durationSec: 4,
        animation: 'product-reveal',
      },
      {
        role: 'benefits',
        layout: 'product-right',
        assetRole: 'productSecondary',
        headline: 'Twelve Hours of Depth',
        subtext: 'One spray lingers until midnight',
        cta: '',
        voiceover: 'One spray lingers for twelve hours, from morning until midnight.',
        durationSec: 4,
        animation: 'fade-in',
      },
      {
        role: 'cta',
        layout: 'product-right',
        assetRole: 'productHero',
        headline: 'Aurelle No. 9',
        subtext: 'Free shipping this week only',
        cta: 'Shop Now',
        voiceover: 'Discover Aurelle Number Nine today.',
        durationSec: 3,
        animation: 'fade-in',
      },
    ],
    format: toFormat(aspectRatio),
    adType: 'product',
  });
}
