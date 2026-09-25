import 'dotenv/config';
import OpenAI from 'openai';
import { getOpenRouterClient } from './openrouter.js';

// Groq fallback models, split by how much reasoning the calling node needs.
// Override per tier in .env without touching node code.
export const GROQ_STRONG_MODEL = process.env.GROQ_MODEL_STRONG || 'openai/gpt-oss-120b';
export const GROQ_FAST_MODEL = process.env.GROQ_MODEL_FAST || 'openai/gpt-oss-20b';

let groqClient = null;

/**
 * Returns a singleton instance of the OpenAI client configured for the Groq API.
 */
export function getGroqClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing in your .env file.');
    }
    groqClient = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export function hasLlmProvider() {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY);
}

/**
 * OpenAI-compatible client that uses OpenRouter first and automatically falls
 * back to Groq when OpenRouter errors or is out of credits. Callers may pass
 * `groqModel` to choose the fallback model for their node; it is stripped
 * before the OpenRouter request.
 */
export function getLlmClient() {
  return {
    chat: {
      completions: {
        async create({ groqModel, ...params }) {
          if (process.env.OPENROUTER_API_KEY) {
            let failure = null;
            try {
              const res = await getOpenRouterClient().chat.completions.create(params);
              if (Array.isArray(res?.choices) && res.choices.length > 0) return res;
              // OpenRouter sometimes answers HTTP 200 with an error payload (e.g. an
              // upstream 503 from the model provider) instead of throwing, so the
              // choices check above is what catches those.
              failure = new Error(res?.error?.message || 'malformed response (no choices returned)');
              failure.status = res?.error?.code;
            } catch (err) {
              failure = err;
            }
            if (!process.env.GROQ_API_KEY) throw failure;
            console.warn(
              `[LLM] OpenRouter failed${failure.status ? ` (HTTP ${failure.status})` : ''} — falling back to Groq (${groqModel || GROQ_STRONG_MODEL}): ${failure.message}`
            );
          }
          // `reasoning` is an OpenRouter-only parameter; Groq rejects it with a 400.
          const { reasoning: _reasoning, ...groqParams } = params;
          return getGroqClient().chat.completions.create({ ...groqParams, model: groqModel || GROQ_STRONG_MODEL });
        },
      },
    },
  };
}
