import {
  buildEditPayload,
  type AspectRatio,
  type ResumeResponse,
  type ScrapeData,
  type SceneCard,
} from "./adScenes";

// Base path for every backend call.
// - Local dev: unset NEXT_PUBLIC_API_URL → same-origin "/api", which Next.js
//   proxies to the backend via the rewrites in next.config.ts (BACKEND_URL).
// - Production: set NEXT_PUBLIC_API_URL (e.g. https://your-app.onrender.com/api)
//   so the browser calls the backend DIRECTLY. Vercel's proxy would kill any
//   request longer than 5 minutes, and the generation pipeline can run that
//   long. The backend's CORS is open to all origins, so direct calls work.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

async function post<T extends { error?: string | null }>(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("Your network connection looks weak or unstable, so we couldn't reach the generation service. Check your internet and try again.");
  }

  const data = (await response.json().catch(() => ({}))) as T;
  if (!response.ok || data.error) {
    throw new Error(data.error || `The ${path} request failed (HTTP ${response.status}).`);
  }
  return data;
}

/** Runs the full pipeline for a URL and pauses for review. */
export function generateAd(
  url: string,
  aspectRatio: AspectRatio = "9:16",
  signal?: AbortSignal
): Promise<ScrapeData> {
  return post<ScrapeData>("/scrape", { url, aspectRatio }, signal);
}

const startedRuns = new Map<string, Promise<ScrapeData>>();

/**
 * One pipeline run per URL, even when React mounts the caller twice. In dev the
 * double mount used to send two /scrape requests, and the backend charges for
 * both: Firecrawl, the vision pass and a JSON2Video render.
 */
export function generateAdOnce(url: string, aspectRatio: AspectRatio = "9:16"): Promise<ScrapeData> {
  const key = `${url}|${aspectRatio}`;
  const existing = startedRuns.get(key);
  if (existing) return existing;

  const run = generateAd(url, aspectRatio);
  startedRuns.set(key, run);
  void run.catch(() => undefined).then(() => startedRuns.delete(key));
  return run;
}

/** Applies edited scene copy and re-renders the video at the chosen frame size. */
export function applySceneEdits(
  threadId: string,
  scenes: SceneCard[],
  aspectRatio: AspectRatio
): Promise<ResumeResponse> {
  return post<ResumeResponse>("/resume", { thread_id: threadId, decision: buildEditPayload(scenes, aspectRatio) });
}
