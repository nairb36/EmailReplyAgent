from pydantic import BaseModel


class KBCreateRequest(BaseModel):
    title: str
    content: str
    openai_api_key: str


class KBItem(BaseModel):
    id: str
    title: str
    content: str
    created_at: str


class KBListResponse(BaseModel):
    items: list[KBItem]
