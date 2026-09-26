const KEY_PREFIX = "vibe:scrape:";

export function readScrapeCache<T>(url: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY_PREFIX + url);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeScrapeCache(url: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY_PREFIX + url, JSON.stringify(data));
  } catch {
    // storage full or unavailable — caching is best-effort
  }
}
