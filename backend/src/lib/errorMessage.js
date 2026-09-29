// Maps low-level failures (mostly network) into copy the UI can show directly,
// so users see "your network is weak" instead of "Firecrawl scrape failed: fetch failed".
const NETWORK_ERROR_PATTERN =
  /fetch failed|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EHOSTUNREACH|ENETUNREACH|socket hang up|network error|timed? ?out|aborted|unreachable/i;

function messageOf(error) {
  if (typeof error === 'string') return error;
  return error instanceof Error ? error.message : '';
}

function causeCodeOf(error) {
  let current = error?.cause;
  while (current) {
    if (typeof current.code === 'string') return current.code;
    current = current.cause;
  }
  return '';
}

export function isNetworkError(error) {
  return (
    NETWORK_ERROR_PATTERN.test(messageOf(error)) ||
    NETWORK_ERROR_PATTERN.test(causeCodeOf(error))
  );
}

export function networkErrorMessage() {
  return "Your network connection looks weak or unstable, so we couldn't reach the website. Check your internet and try again.";
}
