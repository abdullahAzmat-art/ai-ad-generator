import { buildEditPayload, type ResumeResponse, type ScrapeData, type SceneCard } from "./adScenes";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
    throw new Error("Cannot reach the generation service. Is the backend running on port 4000?");
  }

  const data = (await response.json().catch(() => ({}))) as T;
  if (!response.ok || data.error) {
    throw new Error(data.error || `The ${path} request failed (HTTP ${response.status}).`);
  }
  return data;
}

/** Runs the full pipeline for a URL and pauses for review. */
export function generateAd(url: string, aspectRatio = "9:16", signal?: AbortSignal): Promise<ScrapeData> {
  return post<ScrapeData>("/scrape", { url, aspectRatio }, signal);
}

/** Applies edited scene copy and re-renders the video. */
export function applySceneEdits(threadId: string, scenes: SceneCard[]): Promise<ResumeResponse> {
  return post<ResumeResponse>("/resume", { thread_id: threadId, decision: buildEditPayload(scenes) });
}
