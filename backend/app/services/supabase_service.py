from datetime import datetime

from supabase import Client, create_client

from app.config import settings
from app.models.user import UserCreate

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY,
        )
    return _supabase_client


def upsert_user(user_data: UserCreate) -> dict:
    client = get_supabase_client()
    payload = {
        "email": user_data.email,
        "name": user_data.name,
        "avatar_url": user_data.avatar_url,
        "google_access_token": user_data.google_access_token,
        "google_refresh_token": user_data.google_refresh_token,
        "google_token_expiry": (
            user_data.google_token_expiry.isoformat()
            if user_data.google_token_expiry
            else None
        ),
    }
    result = (
        client.table("users")
        .upsert(payload, on_conflict="email")
        .execute()
    )
    return result.data[0]


def get_user_by_id(user_id: str) -> dict | None:
    client = get_supabase_client()
    result = (
        client.table("users")
        .select("*")
        .eq("id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


def get_user_by_email(email: str) -> dict | None:
    client = get_supabase_client()
    result = (
        client.table("users")
        .select("*")
        .eq("email", email)
        .execute()
    )
    return result.data[0] if result.data else None


def update_user_tokens(
    user_id: str,
    access_token: str,
    refresh_token: str | None,
    expiry: datetime | None,
) -> None:
    client = get_supabase_client()
    payload: dict = {"google_access_token": access_token}
    if refresh_token is not None:
        payload["google_refresh_token"] = refresh_token
    if expiry is not None:
        payload["google_token_expiry"] = expiry.isoformat()
    client.table("users").update(payload).eq("id", user_id).execute()
