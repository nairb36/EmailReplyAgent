# TODO

## Deployment
- [ ] Deploy backend to Railway (or Render for free tier)
- [ ] Deploy frontend to Vercel
- [ ] Update Google OAuth redirect URIs for production URLs
- [ ] Update backend CORS origins to allow production frontend URL

## Features
- [ ] RAG embedding support for Gemini/Anthropic (currently OpenAI-only for embeddings)
- [ ] Mobile responsive layout
- [ ] Email search/filter in inbox
- [ ] Pagination (load more emails on scroll)
- [ ] Draft history — view previously generated drafts
- [ ] Feedback analytics — dashboard showing rating trends over time
- [ ] Multiple Gmail account support
- [ ] Attachment handling (view and include in context)
- [ ] Custom system prompts — let users customize the LLM's reply style/tone
- [ ] Auto-refresh inbox on interval

## Polish
- [ ] Better error handling and retry logic for Gmail API token expiry
- [ ] Loading states for thread view
- [ ] Keyboard shortcuts (j/k to navigate emails, r to reply)
- [ ] Email compose (not just reply)
- [ ] Unread/read status tracking
