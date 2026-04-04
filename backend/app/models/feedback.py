from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    draft_id: str
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class FeedbackResponse(BaseModel):
    id: str
    draft_id: str
    rating: int
    comment: str | None
    created_at: str
