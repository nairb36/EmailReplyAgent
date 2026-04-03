from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status

from app.models.auth import GoogleAuthRequest, TokenResponse
from app.models.user import UserCreate, UserResponse
from app.services import auth_service, supabase_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest):
    # Verify the Google access token and get user info
    try:
        google_user = await auth_service.verify_google_token(body.access_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google access token",
        )

    # Parse token expiry
    token_expiry = None
    if body.token_expiry:
        try:
            token_expiry = datetime.fromisoformat(body.token_expiry)
        except ValueError:
            # Fallback: treat as seconds from now
            try:
                token_expiry = datetime.now(timezone.utc) + timedelta(
                    seconds=int(body.token_expiry)
                )
            except (ValueError, TypeError):
                token_expiry = None

    # Encrypt tokens before storing
    encrypted_access = auth_service.encrypt_token(body.access_token)
    encrypted_refresh = (
        auth_service.encrypt_token(body.refresh_token) if body.refresh_token else None
    )

    # Upsert user in Supabase
    user_data = UserCreate(
        email=google_user["email"],
        name=google_user.get("name"),
        avatar_url=google_user.get("picture"),
        google_access_token=encrypted_access,
        google_refresh_token=encrypted_refresh,
        google_token_expiry=token_expiry,
    )
    user = supabase_service.upsert_user(user_data)

    # Create backend JWT
    jwt_token = auth_service.create_jwt(
        user_id=str(user["id"]),
        email=user["email"],
    )

    return TokenResponse(
        token=jwt_token,
        user=UserResponse(**user),
    )
