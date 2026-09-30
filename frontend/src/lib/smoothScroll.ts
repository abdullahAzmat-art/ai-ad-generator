import type LocomotiveScroll from "locomotive-scroll";

let instance: LocomotiveScroll | null = null;

export function setSmoothScroll(scroll: LocomotiveScroll | null) {
  instance = scroll;
}

export function getSmoothScroll() {
  return instance;
}
