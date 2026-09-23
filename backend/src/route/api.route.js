import { Router } from 'express';
import { scrapeController } from '../controller/scrape.controller.js';
import { resumeController } from '../controller/resume.controller.js';

const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'backend' });
});

apiRouter.post('/scrape', scrapeController);
apiRouter.post('/resume', resumeController);

export default apiRouter;