# Backend

Node.js and Express API for the US Client Vibe application.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

The API runs at `http://localhost:4000`.

## Endpoints

- `GET /api/health` checks that the server is running.
- `POST /api/scrape` accepts `{ "url": "https://example.com" }` and uses Firecrawl. Set `FIRECRAWL_API_KEY` in `.env` first.

LangChain and LangGraph are installed and ready for agent or workflow implementations.