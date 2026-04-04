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


def create_draft(
    user_id: str,
    gmail_message_id: str,
    thread_id: str | None,
    to_address: str,
    subject: str,
    ai_draft_body: str,
) -> dict:
    client = get_supabase_client()
    payload = {
        "user_id": user_id,
        "gmail_message_id": gmail_message_id,
        "thread_id": thread_id,
        "to_address": to_address,
        "subject": subject,
        "ai_draft_body": ai_draft_body,
    }
    result = client.table("drafts").insert(payload).execute()
    return result.data[0]


def update_draft_sent(
    draft_id: str,
    final_body: str,
    sent_at: datetime,
) -> dict:
    client = get_supabase_client()
    payload = {
        "final_body": final_body,
        "sent_at": sent_at.isoformat(),
    }
    result = (
        client.table("drafts")
        .update(payload)
        .eq("id", draft_id)
        .execute()
    )
    return result.data[0]


def get_drafts_by_user(user_id: str) -> list[dict]:
    client = get_supabase_client()
    result = (
        client.table("drafts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


# --- Knowledge Base ---


def create_kb_item(
    user_id: str,
    title: str,
    content: str,
    embedding: list[float],
) -> dict:
    client = get_supabase_client()
    payload = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "embedding": embedding,
    }
    result = client.table("knowledge_base").insert(payload).execute()
    return result.data[0]


def get_kb_items(user_id: str) -> list[dict]:
    client = get_supabase_client()
    result = (
        client.table("knowledge_base")
        .select("id, title, content, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def delete_kb_item(item_id: str, user_id: str) -> bool:
    client = get_supabase_client()
    result = (
        client.table("knowledge_base")
        .delete()
        .eq("id", item_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0


def search_kb(user_id: str, query_embedding: list[float], match_count: int = 3) -> list[dict]:
    client = get_supabase_client()
    result = client.rpc(
        "match_knowledge",
        {
            "query_embedding": query_embedding,
            "match_user_id": user_id,
            "match_count": match_count,
            "match_threshold": 0.5,
        },
    ).execute()
    return result.data
