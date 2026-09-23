import { MIN_IMAGES } from "../lib/config.js";

export function routeImages(state) {
  return state.scraped.images.length >= MIN_IMAGES ? "draft" : "pexels";
}

export function routeReview(state) {
  const MAX_REVISIONS = 2;
  return state.approved || state.iterations > MAX_REVISIONS ? "render" : "draft";
}

export function routeHumanReview(state) {
  const action = state.decision?.action;
  if (action === 'edit') {
    return 'apply_edits';
  }
  return 'finalize';
}
