import { fullBleed } from './fullBleed.js';
import { split } from './split.js';
import { ctaClose } from './ctaClose.js';
import { productShowcase } from './productShowcase.js';
import { productEndCard } from './productEndCard.js';
import { serviceIntro } from './serviceIntro.js';
import { serviceEndCard } from './serviceEndCard.js';

export const TEMPLATES = {
  'full-bleed': fullBleed,
  split,
  'cta-close': ctaClose,
  'product-showcase': productShowcase,
  'product-end-card': productEndCard,
  'service-intro': serviceIntro,
  'service-end-card': serviceEndCard,
};
