import { MIN_IMAGES } from "../lib/config.js";

export function routeImages(state) {
  return state.scraped.images.length >= MIN_IMAGES ? "draft" : "pexels";
}
