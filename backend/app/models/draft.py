from pydantic import BaseModel


class DraftRequest(BaseModel):
    message_id: str
    openai_api_key: str


class DraftResponse(BaseModel):
    message_id: str
    draft_body: str
    subject: str
    to_address: str
