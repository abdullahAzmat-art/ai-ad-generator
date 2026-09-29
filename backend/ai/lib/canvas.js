// Every scene template draws on a fixed pixel canvas, and JSON2Video picks that
// canvas from the `resolution` preset below. All three presets share a 1080px
// short side, so one design — measured against the 1080x1920 story frame —
// transfers to any of them.
const PRESETS = {
  '9:16': { resolution: 'instagram-story', w: 1080, h: 1920 },
  '1:1': { resolution: 'squared', w: 1080, h: 1080 },
  '16:9': { resolution: 'full-hd', w: 1920, h: 1080 },
};

export const DEFAULT_ASPECT_RATIO = '9:16';

export const SUPPORTED_ASPECT_RATIOS = Object.keys(PRESETS);

export function isSupportedAspectRatio(value) {
  return typeof value === 'string' && Object.hasOwn(PRESETS, value);
}

/** Script format name stored alongside the scenes. */
export function toFormat(aspectRatio) {
  if (aspectRatio === '16:9') return 'banner';
  if (aspectRatio === '1:1') return 'square';
  return 'story';
}

/**
 * Geometry a template lays a scene out against.
 *
 * `fit` compacts the story frame's vertical rhythm so a shorter canvas still
 * holds the same composition: square and landscape both get 0.66, which keeps
 * the tallest cluster in this project (the service end card, ~1450px of stacked
 * copy) inside 1080px with room above and below it.
 */
export function createCanvas(aspectRatio) {
  const ratio = isSupportedAspectRatio(aspectRatio) ? aspectRatio : DEFAULT_ASPECT_RATIO;
  const { resolution, w, h } = PRESETS[ratio];
  const fit = Math.min(1, Math.max(0.66, h / 1920));
  const px = (value) => Math.round(value * fit);
  const barH = px(160);
  const mid = (width) => Math.round((w - width) / 2);

  return {
    aspectRatio: ratio,
    format: toFormat(ratio),
    resolution,
    w,
    h,
    barH,
    landscape: w > h,
    px,
    mid,
    /** y that centres a block of `height` vertically. */
    middle: (height) => Math.round((h - height) / 2),
    /** y for a block resting `gap` above the brand strip. */
    aboveBar: (height, gap = 0) => h - barH - gap - height,
    /**
     * Horizontal box for a centred block. A landscape frame spends its extra
     * width on the copy instead of stranding a story-width column mid-canvas.
     */
    row: (designWidth) => {
      const width = w > h ? w - px(160) : px(designWidth);
      return { x: mid(width), width };
    },
  };
}
