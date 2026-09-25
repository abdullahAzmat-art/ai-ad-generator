import { adGraph } from '../../ai/graph/index.js';
import crypto from 'crypto';

export async function scrapeController(request, response) {
  const { url, aspectRatio } = request.body ?? {};

  if (!url || typeof url !== 'string') {
    return response.status(400).json({ error: 'A valid url is required.' });
  }

  try {
    const thread_id = crypto.randomUUID();
    const result = await adGraph.invoke(
      { url, aspectRatio },
      { configurable: { thread_id } }
    );
    
    // The graph will now interrupt at human_review, so we return the partial state
    // as well as the thread_id so the frontend can resume it later.
    return response.json({
      thread_id,
      scraped: result.scraped,
      assets: result.assets,
      stockImages: result.stockImages,
      script: result.script,
      videoUrl: result.videoUrl,
    });
  } catch (error) {
    console.error('Scrape workflow failed:', error);
    const message = error instanceof Error ? error.message : 'Unable to scrape the requested URL.';
    const status = message.includes('valid http(s) URL') ? 400 : 502;
    return response.status(status).json({ error: message });
  }
}