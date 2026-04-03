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
