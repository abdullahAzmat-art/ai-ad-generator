import { Router } from 'express';
import { scrapeController } from '../controller/scrape.controller.js';

const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'backend' });
});

apiRouter.post('/scrape', scrapeController);

export default apiRouter;