import { adGraph } from '../../ai/graph/index.js';

export async function scrapeController(request, response) {
  const { url, aspectRatio } = request.body ?? {};

  if (!url || typeof url !== 'string') {
    return response.status(400).json({ error: 'A valid url is required.' });
  }

  try {
    const result = await adGraph.invoke({ url, aspectRatio });
    return response.json(result.scraped);
  } catch (error) {
    console.error('Scrape workflow failed:', error);
    const message = error instanceof Error ? error.message : 'Unable to scrape the requested URL.';
    const status = message.includes('valid http(s) URL') ? 400 : 502;
    return response.status(status).json({ error: message });
  }
}