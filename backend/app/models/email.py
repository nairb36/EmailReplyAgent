from pydantic import BaseModel


class EmailSummary(BaseModel):
    id: str
    thread_id: str | None = None
    from_address: str
    subject: str
    snippet: str
    received_at: str


class EmailDetail(EmailSummary):
    body_text: str
    to_address: str | None = None


class ThreadMessage(BaseModel):
    id: str
    from_address: str
    to_address: str | None = None
    subject: str
    body_text: str
    received_at: str
    is_sent: bool = False


class ThreadResponse(BaseModel):
    thread_id: str
    messages: list[ThreadMessage]
