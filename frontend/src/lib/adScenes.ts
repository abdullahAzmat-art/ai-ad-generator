// Shared types and pure helpers for the /ads scene editor.

export type AdFormat = "story" | "square" | "banner";

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
}

export interface ScrapeData {
  thread_id?: string;
  videoUrl?: string | null;
  error?: string | null;
  assets?: Record<string, string[] | string | undefined>;
  scraped?: {
    title?: string;
    logo?: string;
    brandColor?: string;
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
  }));
}

/**
 * Only copy travels to the backend. Layout, animation, duration and imagery
 * stay as the pipeline planned them, so the video can only change in the ways
 * the user actually edited.
 */
export function buildEditPayload(scenes: SceneCard[]) {
  return {
    action: "edit" as const,
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
  };
}
