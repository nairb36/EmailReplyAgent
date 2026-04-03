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
