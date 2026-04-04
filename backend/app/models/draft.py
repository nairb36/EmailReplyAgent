from pydantic import BaseModel


class DraftRequest(BaseModel):
    message_id: str
    openai_api_key: str


class DraftResponse(BaseModel):
    draft_id: str
    message_id: str
    thread_id: str | None = None
    draft_body: str
    subject: str
    to_address: str
    llm_context: str


class SendRequest(BaseModel):
    draft_id: str
    final_body: str
    subject: str
    to_address: str
    thread_id: str | None = None
    message_id: str | None = None


class SendResponse(BaseModel):
    success: bool
    gmail_message_id: str
    draft_id: str
