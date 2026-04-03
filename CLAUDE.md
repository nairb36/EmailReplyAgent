# CLAUDE.md — EmailReplyAgent

## Project Overview

An AI-powered email reply agent for Gmail. The agent fetches emails from the user's primary inbox, drafts intelligent replies using an LLM, and lets the user review, edit, and approve before sending. All interactions are logged and feedback is collected to improve future drafts.

## Architecture

### Repo Structure
- Monorepo with `frontend/` and `backend/` directories

### Frontend
- **Platform:** Vercel
- **Framework:** Next.js
- **Responsibilities:** Email inbox view, draft editor, one-click send approval, feedback UI, knowledge base management

### Backend
- **Platform:** Railway
- **Responsibilities:** Gmail API integration, LLM-powered draft generation, RAG pipeline, Supabase interactions
- **Language:** Python (FastAPI)

### Database & Knowledge Base
- **Platform:** Supabase (Postgres + pgvector)
- **Tables:**
  - `emails` — original emails fetched from Gmail
  - `drafts` — AI-generated draft and the final version sent by the user
  - `feedback` — star rating (1-5) and textual feedback per reply
  - `knowledge_base` — vectorized knowledge documents for RAG retrieval

### External APIs
- **Gmail API** — fetch emails from primary inbox, send approved replies
- **LLM API** — Both OpenAI and Gemini supported; user can choose per request or set a default
- **Supabase pgvector** — vector similarity search for RAG

## Core Features

1. **Email Fetching** — Pull emails from Gmail primary inbox via Gmail API
2. **AI Draft Generation** — Use LLM (OpenAI/Gemini) to craft reply drafts, optionally augmented with RAG from the knowledge base
3. **Human-in-the-Loop** — User can review and edit AI drafts before sending; no email is ever sent automatically
4. **One-Click Approve & Send** — After review/edit, user clicks once to send
5. **Draft Logging** — Store both the original AI draft and the final sent version in Supabase
6. **Feedback Collection** — Star rating (1-5) and text feedback on every sent reply, stored in Supabase
7. **Knowledge Base (RAG)** — Vector database in Supabase (pgvector); relevant context is retrieved and injected into prompts when crafting replies
8. **Authentication** — Google OAuth login; only the email account owner can access the app

## CRITICAL: Human-in-the-Loop System

**This is a strictly human-in-the-loop system. No email is ever sent without explicit user approval.**

- The AI drafts replies — it NEVER sends them.
- Every draft must be presented to the user for review and optional editing.
- Sending requires an explicit, deliberate user action (one-click approve).
- There is no "auto-send", no "batch send", no scheduled send, no exception to this rule.
- Any code path that sends an email MUST pass through the user approval gate. No bypasses, no overrides.

## Other Key Constraints

- **Authentication is mandatory.** Only the authenticated owner of the Gmail account can access their data.
- **Implementation must be phased.** Plan first, ask clarifying questions, get user preferences, then execute incrementally.
- **Store both drafts.** The AI's original draft and the user's final edited version must both be persisted.
- **Feedback is required.** Every reply should capture a star rating and optional text feedback.

## Implementation Phases

### Phase 1 — Foundation
- Project scaffolding (frontend + backend)
- Google OAuth authentication
- Gmail API integration (fetch emails from primary inbox)

### Phase 2 — AI Drafting
- LLM integration (OpenAI or Gemini)
- Basic draft generation from email context
- Draft review/edit UI

### Phase 3 — Send & Store
- One-click send via Gmail API
- Store original AI draft + final sent version in Supabase
- Email history view

### Phase 4 — Knowledge Base & RAG
- Knowledge base upload/management UI
- Vectorize and store in Supabase (pgvector)
- RAG pipeline: retrieve relevant context and inject into LLM prompts

### Phase 5 — Feedback Loop
- Star rating + text feedback UI per reply
- Store feedback in Supabase
- (Future) Use feedback to improve draft quality

## Development Guidelines

- Ask clarifying questions before making assumptions on ambiguous requirements
- Prefer incremental, working deliverables over big-bang releases
- Keep secrets (API keys, OAuth credentials, tokens) out of version control — use `.env` files
- Never bypass the human approval step for sending emails
