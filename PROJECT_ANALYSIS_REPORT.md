# Project Analysis Report — "Vibe" AI Ad Generator

**Date:** 2026-09-30
**Scope:** Full codebase review — architecture, scalability, file management, code quality, error handling
**Codebase size:** ~6,900 lines of application code across 51 source files (4,624 backend JS + 2,296 frontend TS/TSX), 16 commits

---

## 1. What This Project Is

An AI-powered ad generation SaaS. A user enters a business website URL, and the system automatically produces a finished, brand-matched video ad:

1. **Scrape** the site (Firecrawl) — copy, images, logo, brand colors
2. **Classify** the images via a vision LLM (product hero, lifestyle, logo, etc.)
3. **Detect** the ad type (product / service / business)
4. **Blueprint** the ad structure via LLM; fill asset gaps with Pexels stock
5. **Draft** the scenes (copy, layout, animation) via LLM
6. **Review** with a rules-based critic (up to 2 revision loops)
7. **Render** the video (JSON2Video) — 9:16, 1:1, or 16:9
8. **Human review** — user edits scene copy, system re-renders

**Stack:** Next.js 16 + React 19 + Tailwind 4 (frontend) · Express 5 + LangGraph + OpenRouter/Groq + Firecrawl + Pexels + JSON2Video (backend)

The LangGraph state machine is the heart of the backend — 11 nodes, conditional routing, a human-in-the-loop interrupt, and an automatic LLM provider fallback (OpenRouter → Groq).

---

## 2. Scalability Analysis

### 2.1 How a request is actually processed

`POST /api/scrape` runs the **entire pipeline inside a single HTTP request**. The connection stays open for the whole run:

| Stage | External calls | Typical wall time |
|---|---|---|
| Firecrawl scrape | 1 (60s timeout) | 5–30s |
| Image validation | Up to 60 probes (8 concurrent, 10s timeout each) | 5–30s |
| LLM extraction | 1 | 3–10s |
| Vision classification | 1 (up to 13 images attached) | 5–15s |
| Detect + blueprint | 2 | 5–15s |
| Pexels gap-fill | 0–4 LLM calls + 0–4 stock searches | 0–20s |
| Draft + review loops | 1–3 | 5–30s |
| JSON2Video render | 1 submit + poll every 5s (up to 36 polls) | 30s–3min |
| **Total per ad** | **~7–11 LLM calls, 1 scrape, ~30–60 probes, 1–2 renders** | **~1.5–5 min** |

### 2.2 So how many users at the same time?

The honest answer has three tiers, because the two halves of the app scale completely differently:

**Tier 1 — Visitors browsing the site (marketing pages, pricing, etc.):**
Effectively **unlimited — 10,000+ concurrent visitors**. The Next.js frontend is static/client-rendered with no server data fetching; on a CDN or Vercel it scales independently of the backend.

**Tier 2 — Users actively generating ads (the real bottleneck):**
With the free-tier API keys the project is configured around (free OpenRouter models, Groq fallback, per `.env.example`): **only ~2–5 simultaneous generations** before rate limits cascade — Firecrawl's free tier allows ~1 concurrent scrape, Groq free is ~30 requests/min, and each generation needs 7–11 LLM calls.

With paid API tiers on the current **single backend instance**: **~50–200 concurrent in-flight generations**. The event loop isn't the limit (the pipeline is almost pure I/O-await); the limits are JSON2Video's concurrent-render cap, LLM provider throughput, and memory. Assuming ~5–10% of logged-in users are mid-generation at any moment, that supports roughly **500–2,000 concurrent users** on one instance.

**Tier 3 — The hard ceiling (architecture):**
**The backend cannot scale horizontally as built.** Two reasons:

1. `MemorySaver` checkpointer — every review session lives **in process RAM**. Run two instances behind a load balancer and `/api/resume` randomly hits the wrong instance → "session no longer active" (410). Every restart or deploy also **loses all in-progress user reviews**.
2. Unbounded memory growth — LangGraph keeps the **full checkpoint history of every thread forever** (state after each of ~11 nodes, including 4KB of scraped page text per snapshot). Roughly 0.5–1MB per generation, never evicted → a slow leak toward OOM under sustained traffic.

A secondary risk: Node's default `server.requestTimeout` is **5 minutes**, and a full pipeline run (scrape + LLMs + 3-min render poll) can approach or exceed it — the connection dies mid-render with no user feedback.

**Verdict: this is a well-built prototype-scale system. It comfortably serves a demo, pilot, or small client base (~dozens to low hundreds of active users). It is one architectural step away from real scale.**

### 2.3 What it takes to reach 10,000 concurrent users

| # | Change | Unlocks |
|---|---|---|
| 1 | Swap `MemorySaver` → Postgres/Redis checkpointer (LangGraph supports both natively) | Horizontal scaling + sessions survive restarts |
| 2 | Return a job ID immediately; frontend polls or receives a webhook instead of holding the HTTP connection for minutes | Fixes the 5-min timeout, frees connections, enables load balancing |
| 3 | Job queue (BullMQ + Redis) with per-service concurrency caps | Protects external APIs from bursts, smooths 429 cascades |
| 4 | Auth + per-user/IP rate limiting | Right now anyone can hit the open endpoint and burn your Firecrawl/LLM/render credits |
| 5 | Structured logging + request IDs, global error middleware | Observability at scale |
| 6 | Docker + orchestration (PM2/K8s) | Multi-instance deployment |
| 7 | SSRF guard: block private/internal IP ranges on user-supplied URLs | The backend fetches arbitrary user URLs (scrape + probes) — currently exploitable |

---

## 3. Rankings

### 3.1 File Management — **8.5/10 (A-)**

**Strengths**
- Clean two-app layout: `frontend/` and `backend/` each with their own `package.json`, `.gitignore`, and README
- The backend is genuinely well-layered: `src/` (HTTP: server → routes → controllers → lib) cleanly separated from `ai/` (pipeline: `graph/`, `nodes/`, `state/`, `lib/`, `lib/templates/`, `scripts/`)
- Nodes are small (23–322 lines), single-purpose, uniformly named (`*.node.js`)
- 8 layout templates isolated one-per-file with shared `helpers.js` — easy to add a new layout
- Per-node manual test scripts in `ai/scripts/` (10 of them)
- `.env` properly gitignored; `.env.example` documents every key with usage comments

**Deductions**
- `backend/.tmp-verify-final.mp4` — a 98KB temp binary — is **committed to git**
- `.kilo/worktrees/` (AI tooling worktree) is tracked in the repo
- No root README tying the apps together; no CI config, no Dockerfile

### 3.2 Code Written (Quality) — **8/10 (B+)**

**Strengths**
- The best comment discipline I see in small projects: comments explain **why, not what** — the ASCII pipeline diagram in `graph/index.js`, numbered fix annotations (`FIX #1/#2/#3`) in `firecrawl.js`, the geometry rationale in `canvas.js`
- LangGraph is the right architectural choice, and it's used idiomatically (Annotation.Root state, conditional edges, interrupt/resume)
- Smart details everywhere: an 8-at-a-time concurrency pool for image probing, 128KB header sniffing instead of full image downloads, detection of OpenRouter's "HTTP 200 with an error body" quirk, frontend run-deduplication (`generateAdOnce`) that prevents double-billing on React double-mounts, sessionStorage response caching
- Frontend has a typed data layer (`adScenes.ts`) and a clean component split

**Deductions**
- **No automated tests** — the scripts in `ai/scripts/` are manual smoke tests, not a runnable suite; nothing runs in CI (there is no CI)
- Backend is plain JS: no TypeScript, no ESLint config, no JSDoc on node functions
- `console.log`-only logging — no request IDs, no structured output
- Model names hardcoded inside nodes (`'openai/gpt-4o-mini'`, `'nvidia/nemotron-...:free'`) instead of config
- `GenerateAdModal.tsx` (418 lines) and `ads/page.tsx` (375 lines) are doing a lot; both could decompose
- SSRF exposure (see 2.3 #7)

### 3.3 Error Handling — **9/10 (A-)** — the standout category

**Strengths**
- **Every external fetch has an AbortController timeout** (4s image HEADs, 10s probes, 30s render submit) — most small projects skip this entirely
- **Automatic OpenRouter → Groq fallback**, including the subtle case where OpenRouter returns HTTP 200 with an error payload
- A **network-error classifier** that walks the error cause chain (`ENOTFOUND`, `ETIMEDOUT`, `ECONNRESET`...) and maps it to human-friendly copy — users see "your network looks weak" instead of "fetch failed"
- **Bounded retries everywhere**: max 2 review iterations, max 36 render polls, probe pools that stop early
- A **rules-based review node** that validates LLM output before render (scene counts, 8-word headline limit, duration bounds 8–20s, CTA only on final scene)
- **Graceful degradation at every layer**: classification falls back to heuristic assets if the vision call fails, LLM extraction falls back to empty, Pexels is optional, render mocks in dev
- Correct HTTP semantics: 400/410/500/502 — and **410 Gone for dead review sessions** is a genuinely nice touch
- Errors are **routed in the graph**: rejected edits go back to human review, never to the render engine
- Frontend distinguishes AbortError from network failure, tolerates non-JSON error bodies, guards against unmounted setState

**Deductions**
- No rate limiting and no 429 handling — under burst, OpenRouter failures cascade all traffic onto Groq, which then also fails
- Raw internal error details (`errorDetail`) are returned to the client — deliberate for debugging, but should be env-gated in production
- No global Express error middleware; no dependency-aware health check (the health endpoint always says "ok")
- No overall pipeline timeout (see the 5-minute Node default in 2.2)

### Overall: **8.2/10 (B+/A-)**

Production-quality code habits on top of prototype-quality infrastructure. The pipeline design, comments, and error handling are well above typical standard for this kind of project; what's missing is the operational layer (auth, queue, persistence, tests, CI) that separates a working product from a scalable one.

---

## 4. Priority Fix List

| Priority | Issue | Effort |
|---|---|---|
| P0 | No auth / rate limiting on `POST /api/scrape` — open endpoint that spends paid API credits per call | Small |
| P0 | SSRF: server fetches arbitrary user-supplied URLs (scrape, image probes, HEAD checks) | Small |
| P1 | `MemorySaver` → persistent checkpointer (Postgres/Redis) | Medium |
| P1 | Pipeline runs inside one HTTP request (up to ~5 min) → switch to job ID + polling/webhook | Medium |
| P2 | Remove `.tmp-verify-final.mp4` and `.kilo/` from git history | Small |
| P2 | Add automated tests (the review node and `validateImages` are pure logic — perfect first targets) | Medium |
| P2 | Env-gate `errorDetail` leakage; add request IDs | Small |
| P3 | Centralize model names into config; ESLint for backend | Small |
