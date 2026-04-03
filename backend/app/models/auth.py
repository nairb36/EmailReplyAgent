from pydantic import BaseModel

from app.models.user import UserResponse


class GoogleAuthRequest(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_expiry: str | None = None


class TokenResponse(BaseModel):
    token: str
    user: UserResponse
