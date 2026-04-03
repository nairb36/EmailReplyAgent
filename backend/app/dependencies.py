from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services import auth_service, supabase_service

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    try:
        payload = auth_service.verify_jwt(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = supabase_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Check if Google access token is expired and refresh if possible
    expiry_str = user.get("google_token_expiry")
    if expiry_str:
        try:
            expiry = datetime.fromisoformat(expiry_str)
            if expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=timezone.utc)
            if expiry <= datetime.now(timezone.utc):
                refresh_token = user.get("google_refresh_token")
                if refresh_token:
                    decrypted_refresh = auth_service.decrypt_token(refresh_token)
                    refreshed = await auth_service.refresh_google_token(decrypted_refresh)
                    new_access = refreshed["access_token"]
                    new_expiry = datetime.now(timezone.utc) + timedelta(
                        seconds=refreshed.get("expires_in", 3600)
                    )
                    encrypted_access = auth_service.encrypt_token(new_access)
                    supabase_service.update_user_tokens(
                        user_id=user["id"],
                        access_token=encrypted_access,
                        refresh_token=None,
                        expiry=new_expiry,
                    )
                    user["google_access_token"] = encrypted_access
                    user["google_token_expiry"] = new_expiry.isoformat()
        except (ValueError, TypeError):
            pass  # If expiry parsing fails, proceed with existing token

    return user
