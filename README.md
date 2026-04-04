# MyMail

An AI-powered email reply assistant for Gmail. MyMail fetches your inbox, drafts intelligent replies using your choice of LLM, and lets you review, edit, and send — all with a human-in-the-loop workflow.

## Features

- **Gmail Integration** — Fetches emails from your primary inbox with full thread/conversation view
- **Multi-Provider AI Drafts** — Generate reply drafts using OpenAI (GPT-4o-mini), Anthropic (Claude Sonnet), or Google Gemini
- **Knowledge Base (RAG)** — Upload documents to a vector knowledge base; relevant context is automatically retrieved and injected into LLM prompts for more personalized replies
- **Human-in-the-Loop** — AI drafts replies but never sends without explicit user approval. Every draft can be reviewed and edited before sending
- **Feedback Loop** — Star rating (1-5) and optional text feedback on every sent reply
- **Dark Mode** — Full dark mode support across all components
- **LLM Context Panel** — See exactly what context was sent to the LLM for each draft

## Architecture

```
frontend/          Next.js (App Router, Tailwind CSS)
backend/           Python (FastAPI)
supabase/          Database migrations
```

- **Auth:** Google OAuth via NextAuth → tokens encrypted and stored in Supabase
- **Database:** Supabase (Postgres + pgvector)
- **Tables:** `users`, `emails`, `drafts`, `feedback`, `knowledge_base`

## Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project (with pgvector extension enabled)
- Google Cloud project with OAuth credentials and Gmail API enabled
- At least one LLM API key (OpenAI, Anthropic, or Gemini)

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ENCRYPTION_KEY=your_fernet_key
JWT_SECRET=your_jwt_secret
```

Run the Supabase migrations in order from `supabase/migrations/`.

Start the server:
```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

Start the dev server:
```bash
npm run dev
```

## Usage

1. Open `http://localhost:3000` and sign in with Google
2. Click **API Key** in the navbar to add your LLM API key(s)
3. Browse your inbox and click an email to view the full thread
4. Click **Generate** (choose provider from dropdown) to draft a reply
5. Review and edit the draft, then click **Send**
6. Rate the reply quality with star rating and optional feedback

## API Key Notes

- All API keys are stored in your browser's localStorage only — never sent to the backend for storage
- Keys are sent per-request to the respective LLM API for draft generation
- **OpenAI key is required for Knowledge Base (RAG) features**, even when using Anthropic or Gemini for generation (OpenAI embeddings are used for vector search)

## Deployment

**Frontend** → Vercel
- Set root directory to `frontend/`
- Configure env vars: `NEXT_PUBLIC_BACKEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

**Backend** → Railway (or Render for free tier)
- Configure env vars from `backend/.env`
- Update Google OAuth redirect URIs in Google Cloud Console
- Update CORS origins in `backend/app/main.py` to allow the Vercel frontend URL
