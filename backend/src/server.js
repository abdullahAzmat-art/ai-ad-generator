import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import Firecrawl from '@mendable/firecrawl-js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'backend' });
});

app.post('/api/scrape', async (request, response) => {
  const { url } = request.body ?? {};

  if (!url || typeof url !== 'string') {
    return response.status(400).json({ error: 'A valid url is required.' });
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    return response.status(503).json({ error: 'FIRECRAWL_API_KEY is not configured.' });
  }

  try {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    const result = await firecrawl.scrape(url, { formats: ['markdown'] });
    return response.json(result);
  } catch (error) {
    console.error('Firecrawl request failed:', error);
    return response.status(502).json({ error: 'Unable to scrape the requested URL.' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});