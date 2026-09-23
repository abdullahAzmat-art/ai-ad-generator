import { fullBleed } from './fullBleed.js';
import { split } from './split.js';
import { ctaClose } from './ctaClose.js';

export const TEMPLATES = {
  "full-bleed": fullBleed,  // Layout 1 — hook scene
  "split": split,           // Layout 2 — benefit scene (requires brandColor as 3rd arg)
  "cta-close": ctaClose     // Layout 3 — CTA close scene
};
