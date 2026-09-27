import { imageSize } from 'image-size';

const FETCH_TIMEOUT_MS = 10000;
/**
 * Probes run a few at a time. Firing every candidate at one CDN at once gets
 * the client throttled by its bot protection, and the throttled requests just
 * sit there until the timeout — which looked like "the image is bad" in the
 * logs while it was really us overloading the host.
 */
const PROBE_CONCURRENCY = 8;
/** Bytes enough for any image header/SOF marker, without downloading full assets. */
const SNIFF_BYTES = 128 * 1024;

// CDNs behind bot protection answer a headerless Node request with 403.
const BROWSER_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
};

/**
 * Reads the leading bytes of an image. No `Range` header: several CDNs answer
 * ranged requests with 416/403 while serving the same object happily in full,
 * and cancelling the stream keeps the transfer bounded either way.
 */
async function readImageBytes(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { headers: BROWSER_HEADERS, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    const chunks = [];
    let received = 0;

    if (response.body) {
      const reader = response.body.getReader();
      while (received < SNIFF_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
      }
      reader.releaseLock();
    } else {
      const buffer = await response.arrayBuffer();
      chunks.push(new Uint8Array(buffer, 0, Math.min(buffer.byteLength, SNIFF_BYTES)));
      received = chunks[0].byteLength;
    }

    controller.abort();
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return { bytes, contentType, totalBytes: received };
  } finally {
    clearTimeout(timeout);
  }
}

function readDimensions(bytes) {
  try {
    const { width, height } = imageSize(bytes);
    return width && height ? { width, height } : null;
  } catch {
    // Truncated header or an unsupported format — not proof of a bad image.
    return null;
  }
}

/**
 * Fails only on evidence we can act on: an unreachable URL, or a raster whose
 * header we read but whose box is too small or too extreme for a 1080x1920
 * frame. Vectors pass on sight, since their pixel box says nothing about how
 * large they render.
 */
export async function inspectImage(url, { minShortSide = 480, minRatio = 0.3, maxRatio = 4 } = {}) {
  try {
    const { bytes, contentType } = await readImageBytes(url);
    const dimensions = readDimensions(bytes);
    // Vector art renders crisp at any size, so its intrinsic pixel box (a
    // 74x24 wordmark, say) says nothing about how usable it is.
    const isSvg = contentType.includes('svg') || url.startsWith('data:image/svg') || /\.svg([?#]|$)/i.test(url);
    if (isSvg) return { ok: true, url, width: dimensions?.width ?? null, height: dimensions?.height ?? null, note: 'svg' };

    if (!dimensions) {
      return {
        ok: false,
        url,
        reason: contentType.startsWith('image/')
          ? 'header not found in first 128KB'
          : `content-type "${contentType || 'none'}" and no readable header`,
      };
    }

    const { width, height } = dimensions;
    const shortSide = Math.min(width, height);
    const ratio = width / height;

    if (shortSide < minShortSide) {
      return { ok: false, url, width, height, reason: `${width}x${height} below ${minShortSide}px short side` };
    }
    if (ratio < minRatio || ratio > maxRatio) {
      return { ok: false, url, width, height, reason: `ratio ${ratio.toFixed(2)} outside ${minRatio}–${maxRatio}` };
    }

    return { ok: true, url, width, height };
  } catch (error) {
    return { ok: false, url, reason: error instanceof Error ? error.message : String(error) };
  }
}

/** Runs `fn` over `items` with at most `limit` in flight, preserving order. */
async function mapPool(items, limit, fn, shouldContinue) {
  const results = new Array(items.length);
  let next = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length && (shouldContinue?.() ?? true)) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function filterGoodImages(urls, options = {}) {
  const { limit = Infinity, ...inspectOptions } = options;
  let kept = 0;

  const reports = await mapPool(
    urls,
    PROBE_CONCURRENCY,
    async (url) => {
      const report = await inspectImage(url, inspectOptions);
      if (report.ok) kept++;
      return report;
    },
    () => kept < limit
  );

  const usable = reports.filter(Boolean).filter((report) => report.ok);

  if (process.env.DEBUG_SCRAPE === '1') {
    for (const report of reports) {
      if (!report) continue; // never probed: the limit was already met
      const size = report.width ? ` ${report.width}x${report.height}` : '';
      console.log(
        report.ok
          ? `[validateImages] keep${size}  ${report.url}${report.note ? ` (${report.note})` : ''}`
          : `[validateImages] drop ${report.reason} — ${report.url}`
      );
    }
    const skipped = reports.filter((report) => !report).length;
    if (skipped) {
      console.log(`[validateImages] ${skipped} candidate(s) left unprobed once ${limit} usable image(s) were found.`);
    }
  }

  return usable.slice(0, limit).map((report) => report.url);
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

  // A favicon is small by definition, so only a fetch failure or a squashed
  // square disqualifies one.
  const probe = { minShortSide: 32, minRatio: 0.05, maxRatio: 20 };

  // Firecrawl inlines some logos as `data:image/svg+xml` markup. Those work in
  // the brand pill but are kilobytes of URL that the renderer has to carry
  // around, so a hosted logo always wins when one is available.
  const [hosted, inline] = [candidates.filter((url) => /^https?:/i.test(url)), candidates.filter((url) => !/^https?:/i.test(url))];

  for (const url of [...hosted, ...inline]) {
    const report = await inspectImage(url, probe);
    if (report.ok) return url;
    if (process.env.DEBUG_SCRAPE === '1') {
      console.log(`[validateImages] logo candidate rejected (${report.reason}): ${url.slice(0, 120)}`);
    }
  }

  return null;
}
