import 'dotenv/config';
import OpenAI from 'openai';

let openRouterClient = null;

/**
 * Returns a singleton instance of the OpenAI client configured for OpenRouter.
 */
export function getOpenRouterClient() {
  if (!openRouterClient) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is missing in your .env file.');
    }
    openRouterClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return openRouterClient;
}
