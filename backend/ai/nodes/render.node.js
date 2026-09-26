import 'dotenv/config';

async function resolveImageUrl(scene, assets, stockImages, sceneIndex) {
  const role = scene.assetRole;
  const availableAssets = assets || {};
  const candidates = [];

  const addCandidate = (value, index = 0) => {
    if (typeof value === 'string' && value) {
      candidates.push(value);
      return;
    }

    if (Array.isArray(value) && value.length > 0) {
      candidates.push(value[index % value.length]);
    }
  };

  const requestedAssetIndex = role === 'productSecondary' ? Math.max(0, sceneIndex - 1) : sceneIndex;
  if (role) addCandidate(availableAssets[role], requestedAssetIndex);

  const fallbackOrder = ['productHero', 'productSecondary', 'lifestyle', 'person', 'office', 'food', 'background', 'logo'];
  for (const fallbackRole of fallbackOrder) {
    if (fallbackRole === role) continue;
    addCandidate(availableAssets[fallbackRole], sceneIndex);
  }

  candidates.push(...(stockImages || []));

  for (const url of candidates) {
    if (!url || typeof url !== 'string') continue;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
      // Only skip URLs that explicitly return a client/server error (4xx/5xx)
      if (res.status >= 400) {
        console.warn(`[Render Node] Skipping broken image (HTTP ${res.status}): ${url}`);
        continue;
      }
      return url;
    } catch {
      // Network error, timeout, or redirect issue — still try the URL.
      // The render engine will handle it; don't silently drop valid CDN links.
      return url;
    }
  }

  return null;
}

const RESOLUTION_PRESETS = {
  '9:16': 'instagram-story',
  '16:9': 'full-hd',
  '1:1': 'squared',
};

function normalizeBrandColor(color) {
  return typeof color === 'string' && /^#[0-9a-f]{3,8}$/i.test(color)
    ? color
    : '#C9A24B';
}

function websiteLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

function createBrand(scraped, assets, url, adType) {
  const contact = scraped?.contactBusinessInformation || {};

  return {
    adType,
    color: normalizeBrandColor(scraped?.brandColor || scraped?.colors?.[0]),
    name: scraped?.brandInformation?.name || scraped?.title || 'Your Brand',
    logo: assets?.logo || scraped?.logo || null,
    website: websiteLabel(url),
    contact: contact.phone || contact.email || '',
  };
}

function pickTemplate(scene, imageUrl, brand, isFinalScene, isFirstScene, templates) {
  // 1. PRODUCT ADS
  if (brand.adType === 'product') {
    return isFinalScene
      ? templates['product-end-card'](scene, brand)
      : templates['product-showcase'](scene, imageUrl, brand);
  }

  // 2. SERVICE / BUSINESS ADS
  if (isFirstScene) {
    return templates['service-intro'](scene, brand);
  }

  if (isFinalScene) {
    return templates['service-end-card'](scene, brand);
  }

  // Middle scenes for service ads: use full-bleed or split showing the work
  const layout = scene.layout || 'full-bleed';

  switch (layout) {
    case 'split':
    case 'bottom-text':
    case 'product-left':
    case 'product-right':
    case 'product-center':
      return templates.split(scene, imageUrl, brand.color, brand);
    case 'full-bleed':
    case 'overlay':
    case 'top-text':
    default:
      return templates['full-bleed'](scene, imageUrl, brand);
  }
}

export async function renderNode(state) {
  const {
    script,
    scraped,
    assets = {},
    stockImages = [],
    aspectRatio = '9:16',
    adType = 'business',
    url,
  } = state;

  const apiKey = process.env.JSON2VIDEO_API_KEY;

  if (!apiKey || apiKey === 'your_json2video_api_key_here') {
    console.warn('[Render Node] JSON2VIDEO_API_KEY missing — returning mock URL.');
    return { videoUrl: 'https://cdn.json2video.com/mock-video-url.mp4', error: null };
  }

  if (process.env.DEV_MOCK_RENDER === '1') {
    console.warn('[Render Node] DEV_MOCK_RENDER=1 — skipping real JSON2Video call.');
    console.log('[Render Node] Would have submitted payload with', script.scenes.length, 'scenes.');
    return {
      videoUrl: `https://cdn.json2video.com/dev-mock-${Date.now()}.mp4`,
      error: null,
    };
  }

  if (!script || !Array.isArray(script.scenes) || script.scenes.length === 0) {
    console.error('[Render Node] Invalid or empty script.');
    return { videoUrl: null, error: 'Invalid or empty script.' };
  }

  const brand = createBrand(scraped, assets, url, adType);
  console.log(`[Render Node] ${script.scenes.length} scenes, brand: ${brand.name}`);

  const { TEMPLATES } = await import('../lib/templates/index.js');
  let scenes;

  try {
    scenes = await Promise.all(script.scenes.map(async (scene, index) => {
      const isFinalScene = index === script.scenes.length - 1;
      const isFirstScene = index === 0;
      
      const isProductEndCard = brand.adType === 'product' && isFinalScene;
      const isServiceIntro = brand.adType === 'business' && isFirstScene;
      const isServiceEndCard = brand.adType === 'business' && isFinalScene;
      
      const needsImage = !(isProductEndCard || isServiceIntro || isServiceEndCard);

      const imageUrl = await resolveImageUrl(scene, assets, stockImages, index);

      if (!imageUrl && needsImage) {
        throw new Error(
          `Scene ${index + 1} (${scene.role}): No image found for assetRole "${scene.assetRole}". ` +
          `Available assets: ${Object.keys(assets).filter((key) => assets[key]).join(', ') || 'none'}`
        );
      }

      console.log(
        `[Render Node] Scene ${index + 1} [${scene.role}] layout="${scene.layout}" assetRole="${scene.assetRole}"`
      );

      return pickTemplate(scene, imageUrl, brand, isFinalScene, isFirstScene, TEMPLATES);
    }));
  } catch (error) {
    console.error('[Render Node] Scene build failed:', error.message);
    return { videoUrl: null, error: error.message };
  }

  const totalDuration = script.scenes.reduce((acc, scene) => acc + (scene.durationSec || 4), 0);

  const payload = {
    resolution: RESOLUTION_PRESETS[aspectRatio] || 'instagram-story',
    quality: 'high',
    draft: false,
    elements: [
      {
        type: 'audio',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Reliable background music for testing
        volume: 0.15,
        start: 0,
        duration: totalDuration,
        'fade-in': 1,
        'fade-out': 2
      }
    ],
    scenes,
  };

  if (process.env.DEBUG_RENDER === '1') {
    console.log('[Render Node] Payload:', JSON.stringify(payload, null, 2));
  }

  let videoUrl = null;
  let error = null;

  try {
    console.log('[Render Node] Submitting project to JSON2Video...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    let submitResponse;

    try {
      submitResponse = await fetch('https://api.json2video.com/v2/movies', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchError) {
      const cause = fetchError.cause?.message || fetchError.cause || fetchError.message;
      throw new Error(`Network error connecting to JSON2Video: ${cause}`);
    } finally {
      clearTimeout(timeoutId);
    }

    const submitData = await submitResponse.json();
    if (!submitResponse.ok || !submitData.success) {
      throw new Error(
        `JSON2Video API Error: ${submitData.message || submitData.error || submitResponse.statusText}`
      );
    }

    const projectId = submitData.project;
    console.log(`[Render Node] Project created: ${projectId}. Polling for completion...`);

    for (let retries = 0; retries < 36; retries++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      
      let pollResponse;
      let pollData;
      
      try {
        pollResponse = await fetch(
          `https://api.json2video.com/v2/movies?project=${projectId}`,
          { headers: { 'x-api-key': apiKey } }
        );
        pollData = await pollResponse.json();
      } catch (pollError) {
        console.warn(`[Render Node] Poll ${retries + 1}/36 — Network error during poll, will retry...`);
        continue;
      }

      const status = pollData.movie?.status;
      console.log(`[Render Node] Poll ${retries + 1}/36 — status: ${status}`);

      if (status === 'done') {
        videoUrl = pollData.movie?.url;
        if (!videoUrl) throw new Error('Rendering finished but no video URL returned.');
        break;
      }

      if (status === 'error') {
        throw new Error(pollData.movie?.message || pollData.movie?.error || 'JSON2Video rendering failed.');
      }
    }

    if (!videoUrl) throw new Error('Rendering timed out after 3 minutes.');
  } catch (renderError) {
    console.error('[Render Node] Failed:', renderError.message);
    error = renderError.message;
  }

  return { videoUrl, error };
}
