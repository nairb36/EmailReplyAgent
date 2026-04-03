from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    name: str | None = None
    avatar_url: str | None = None
    google_access_token: str
    google_refresh_token: str | None = None
    google_token_expiry: datetime | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None = None
    avatar_url: str | None = None
    created_at: datetime
