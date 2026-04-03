-- Phase 3: Drafts table to store AI drafts and final sent versions

CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gmail_message_id TEXT NOT NULL,
  thread_id TEXT,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  ai_draft_body TEXT NOT NULL,
  final_body TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drafts_user_id ON drafts(user_id);
CREATE INDEX idx_drafts_created_at ON drafts(created_at DESC);
