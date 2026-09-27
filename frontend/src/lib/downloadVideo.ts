/**
 * Saves the rendered ad. The `download` attribute is ignored for cross-origin
 * URLs, so the file is fetched as a blob first; the browser only offers a real
 * save dialog when the object URL is same-origin.
 *
 * @returns "saved" when the file was downloaded, "opened" when the browser had
 * to fall back to showing the video (a blocked or unreachable CDN response).
 */
export async function downloadVideo(url: string, filename: string): Promise<"saved" | "opened"> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerSave(objectUrl, filename);
    // Revoking immediately works because the download has already started.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    return "saved";
  } catch {
    window.open(url, "_blank", "noopener");
    return "opened";
  }
}

function triggerSave(href: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
