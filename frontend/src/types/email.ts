export interface EmailSummary {
  id: string;
  thread_id?: string;
  from_address: string;
  subject: string;
  snippet: string;
  received_at: string;
}

export interface EmailDetail extends EmailSummary {
  body_text: string;
  to_address?: string;
}

export interface EmailListResponse {
  messages: EmailSummary[];
  next_page_token?: string;
}

export interface ThreadMessage {
  id: string;
  from_address: string;
  to_address?: string;
  subject: string;
  body_text: string;
  received_at: string;
  is_sent: boolean;
}

export interface ThreadResponse {
  thread_id: string;
  messages: ThreadMessage[];
}

export interface DraftResponse {
  draft_id: string;
  message_id: string;
  thread_id?: string;
  draft_body: string;
  subject: string;
  to_address: string;
  llm_context: string;
}

export interface SendResponse {
  success: boolean;
  gmail_message_id: string;
  draft_id: string;
}

export interface FeedbackResponse {
  id: string;
  draft_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
