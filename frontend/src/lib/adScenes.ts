// Shared types and pure helpers for the /ads scene editor.

export type AdFormat = "story" | "square" | "banner";

/** Frame sizes the renderer has a canvas for — mirrors backend/ai/lib/canvas.js. */
export type AspectRatio = "9:16" | "1:1" | "16:9";

export interface RatioOption {
  value: AspectRatio;
  label: string;
  /** Where this frame is normally published. */
  hint: string;
  /** Box shape of a frame at this ratio. */
  frameClass: string;
  /** Width that keeps every ratio about the same height in the editor. */
  widthClass: string;
}

export const ASPECT_RATIOS: RatioOption[] = [
  { value: "9:16", label: "9:16", hint: "Story", frameClass: "aspect-[9/16]", widthClass: "max-w-[240px]" },
  { value: "1:1", label: "1:1", hint: "Square", frameClass: "aspect-square", widthClass: "max-w-[300px]" },
  { value: "16:9", label: "16:9", hint: "Wide", frameClass: "aspect-video", widthClass: "max-w-[380px]" },
];

export const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";

const FORMAT_RATIOS: Record<AdFormat, AspectRatio> = {
  story: "9:16",
  square: "1:1",
  banner: "16:9",
};

const RATIO_BY_VALUE = Object.fromEntries(ASPECT_RATIOS.map((option) => [option.value, option])) as Record<
  AspectRatio,
  RatioOption
>;

export function ratioOption(value: AspectRatio): RatioOption {
  return RATIO_BY_VALUE[value] ?? RATIO_BY_VALUE[DEFAULT_ASPECT_RATIO];
}

/** The ratio the video on screen was actually rendered at. */
export function currentRatio(data?: ScrapeData | null): AspectRatio {
  if (data?.aspectRatio) return data.aspectRatio;
  const format = data?.script?.format;
  return format ? FORMAT_RATIOS[format] : "9:16";
}

export interface SceneCard {
  id: string;
  sceneNumber: number;
  role: string;
  headline: string;
  subtext: string;
  cta: string;
  voiceover: string;
  durationSec: number;
  /** Rendered preview for the card — resolved from the run's assets. */
  imageUrl?: string;
  /** False when the renderer composes this scene as a text-only brand card. */
  hasVisual: boolean;
}

/** The brand strip the renderer paints on every frame. */
export interface AdBrand {
  name: string;
  logo: string | null;
  website: string;
  color: string;
}

export interface ScrapeData {
  thread_id?: string;
  videoUrl?: string | null;
  error?: string | null;
  /** Frame the generated video was rendered at. */
  aspectRatio?: AspectRatio;
  assets?: Record<string, string[] | string | undefined>;
  scraped?: {
    title?: string;
    logo?: string;
    brandColor?: string;
    colors?: string[];
    brandInformation?: { name?: string };
    contactBusinessInformation?: { phone?: string; email?: string };
  };
  script?: {
    format?: AdFormat;
    adType?: string;
    scenes?: Array<{
      id?: string;
      role?: string;
      headline?: string;
      subtext?: string;
      cta?: string;
      voiceover?: string;
      durationSec?: number;
      assetRole?: string;
    }> | null;
  } | null;
}

export interface ResumeResponse {
  success?: boolean;
  script?: ScrapeData["script"];
  /** Frame the re-rendered video came back at. */
  aspectRatio?: AspectRatio;
  videoUrl?: string | null;
  editWarnings?: string[];
  error?: string | null;
}

// Mirrors review.node.js so the editor warns about exactly what the AI
// reviewer would flag. Advisory only — the user is never blocked.
export const COPY_LIMITS = {
  headlineWords: 8,
  subtextWords: 12,
  /** Words a voiceover can speak per second of scene duration. */
  wordsPerSecond: 2.5,
};

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  hook: { bg: "bg-violet-100", text: "text-violet-700", label: "Hook" },
  "product-hero": { bg: "bg-blue-100", text: "text-blue-700", label: "Product Hero" },
  benefits: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Benefits" },
  offer: { bg: "bg-amber-100", text: "text-amber-700", label: "Offer" },
  cta: { bg: "bg-rose-100", text: "text-rose-700", label: "CTA" },
  trust: { bg: "bg-sky-100", text: "text-sky-700", label: "Trust" },
  solution: { bg: "bg-teal-100", text: "text-teal-700", label: "Solution" },
  problem: { bg: "bg-orange-100", text: "text-orange-700", label: "Problem" },
};

export function getRoleStyle(role: string) {
  const key = (role || "").toLowerCase().trim();
  return ROLE_STYLES[key] || { bg: "bg-slate-100", text: "text-slate-600", label: role || "Scene" };
}

function wordCount(text: string) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

/** Copy that is likely to overflow the frame or run past the scene duration. */
export function copyWarnings(scene: SceneCard): string[] {
  const issues: string[] = [];

  const headlineWords = wordCount(scene.headline);
  if (headlineWords === 0) {
    issues.push("No headline — this scene renders as visual and voiceover only.");
  } else if (headlineWords > COPY_LIMITS.headlineWords) {
    issues.push(`Headline is ${headlineWords} words — ${COPY_LIMITS.headlineWords} keep it inside the frame.`);
  }

  const subtextWords = wordCount(scene.subtext);
  if (subtextWords > COPY_LIMITS.subtextWords) {
    issues.push(`Subtext is ${subtextWords} words — ${COPY_LIMITS.subtextWords} keep it readable.`);
  }

  const budget = Math.floor(scene.durationSec * COPY_LIMITS.wordsPerSecond);
  const voiceWords = wordCount(scene.voiceover);
  if (voiceWords > budget) {
    issues.push(`Voiceover is ${voiceWords} words — about ${budget} fit in ${scene.durationSec}s.`);
  }

  return issues;
}

/** Picks the image the backend will composite for this scene. */
function resolvePreviewImage(
  assets: NonNullable<ScrapeData["assets"]>,
  assetRole: string | undefined,
  index: number
): string | undefined {
  const direct = assetRole ? assets[assetRole] : undefined;
  if (Array.isArray(direct) && direct.length > 0) return direct[index % direct.length];
  if (typeof direct === "string") return direct;

  const secondary = assets.productSecondary;
  if (Array.isArray(secondary) && secondary.length > 0) return secondary[index % secondary.length];

  const hero = assets.productHero;
  return (Array.isArray(hero) ? hero[0] : hero) || undefined;
}

export function mapScenes(data: ScrapeData): SceneCard[] {
  const rawScenes = data.script?.scenes;
  if (!rawScenes || rawScenes.length === 0) return [];

  const assets = data.assets ?? {};
  const isProductAd = data.script?.adType === "product";
  const lastIndex = rawScenes.length - 1;

  return rawScenes.map((scene, i) => ({
    id: scene.id || `s-${i + 1}`,
    sceneNumber: i + 1,
    role: scene.role || "scene",
    headline: scene.headline || "",
    subtext: scene.subtext || "",
    cta: scene.cta || "",
    voiceover: scene.voiceover || "",
    durationSec: scene.durationSec || 4,
    imageUrl: resolvePreviewImage(assets, scene.assetRole, i),
    // Mirrors pickTemplate in the renderer: a product ad closes on a text
    // card, a service ad opens and closes on one.
    hasVisual: isProductAd ? i !== lastIndex : i !== 0 && i !== lastIndex,
  }));
}

const DEFAULT_BRAND_COLOR = "#10B981";

/** Same fields the render node assembles into its brand object. */
export function getBrand(data: ScrapeData, website: string): AdBrand {
  const scraped = data.scraped ?? {};
  const rawColor = scraped.brandColor || scraped.colors?.[0] || "";
  const logo = data.assets?.logo ?? scraped.logo ?? "";

  return {
    name: scraped.brandInformation?.name || scraped.title || website,
    logo: typeof logo === "string" && logo ? logo : null,
    website,
    color: /^#[0-9A-F]{6}$/i.test(rawColor) ? rawColor : DEFAULT_BRAND_COLOR,
  };
}

/** Letter mark shown in the brand circle when the site has no logo. */
export function brandInitials(name: string) {
  return (
    (name || "B")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") || "B"
  );
}

/**
 * Copy and the chosen frame travel to the backend; layout, animation, duration
 * and imagery stay as the pipeline planned them, so the video changes only in
 * the ways the user actually edited.
 */
export function buildEditPayload(scenes: SceneCard[], aspectRatio: AspectRatio) {
  return {
    action: "edit" as const,
    aspectRatio,
    edits: {
      scenes: scenes.map((s) => ({
        headline: s.headline,
        subtext: s.subtext,
        voiceover: s.voiceover,
        cta: s.cta,
      })),
    },
  };
}

/** Stores the applied result so revisiting the page shows the current ad. */
export function withAppliedRun(data: ScrapeData, resumed: ResumeResponse): ScrapeData {
  return {
    ...data,
    videoUrl: resumed.videoUrl ?? data.videoUrl,
    script: resumed.script ?? data.script,
    aspectRatio: resumed.aspectRatio ?? data.aspectRatio,
  };
}
