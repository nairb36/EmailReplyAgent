import base64
import email.utils
import re
from datetime import datetime, timezone

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build, Resource

from app.models.email import EmailDetail, EmailSummary


def build_gmail_client(access_token: str) -> Resource:
    credentials = Credentials(token=access_token)
    return build("gmail", "v1", credentials=credentials)


def _parse_email_headers(headers: list) -> dict:
    result = {}
    header_map = {
        "From": "from",
        "To": "to",
        "Subject": "subject",
        "Date": "date",
    }
    for header in headers:
        name = header.get("name", "")
        if name in header_map:
            result[header_map[name]] = header.get("value", "")
    return result


def _parse_mime_body(payload: dict) -> str:
    """Recursively extract body from MIME parts, preferring text/plain."""
    mime_type = payload.get("mimeType", "")

    # If this part has a body with data, decode it
    body_data = payload.get("body", {}).get("data")
    if body_data and mime_type == "text/plain":
        return base64.urlsafe_b64decode(body_data).decode("utf-8", errors="replace")

    # Check nested parts
    parts = payload.get("parts", [])
    if parts:
        # First pass: look for text/plain
        for part in parts:
            if part.get("mimeType") == "text/plain":
                data = part.get("body", {}).get("data")
                if data:
                    return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

        # Second pass: recurse into multipart/* parts
        for part in parts:
            result = _parse_mime_body(part)
            if result:
                return result

    # Fallback: if this part is text/html, strip tags
    if body_data and mime_type == "text/html":
        html = base64.urlsafe_b64decode(body_data).decode("utf-8", errors="replace")
        text = re.sub(r"<[^>]+>", "", html)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    # Last resort: check parts for text/html
    for part in parts:
        if part.get("mimeType") == "text/html":
            data = part.get("body", {}).get("data")
            if data:
                html = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
                text = re.sub(r"<[^>]+>", "", html)
                text = re.sub(r"\s+", " ", text).strip()
                return text

    return ""


def fetch_inbox(
    access_token: str,
    max_results: int = 20,
    page_token: str | None = None,
) -> dict:
    service = build_gmail_client(access_token)

    list_params: dict = {
        "userId": "me",
        "q": "category:primary",
        "maxResults": max_results,
    }
    if page_token:
        list_params["pageToken"] = page_token

    list_result = service.users().messages().list(**list_params).execute()
    messages_meta = list_result.get("messages", [])
    next_page_token = list_result.get("nextPageToken")

    messages: list[EmailSummary] = []
    for msg_meta in messages_meta:
        msg = (
            service.users()
            .messages()
            .get(userId="me", id=msg_meta["id"], format="metadata", metadataHeaders=["From", "Subject", "Date"])
            .execute()
        )
        headers = _parse_email_headers(msg.get("payload", {}).get("headers", []))
        received_at = headers.get("date", "")
        # Try to parse the date robustly
        try:
            parsed_dt = email.utils.parsedate_to_datetime(received_at)
            received_at = parsed_dt.astimezone(timezone.utc).isoformat()
        except (ValueError, TypeError):
            pass  # keep raw date string

        messages.append(
            EmailSummary(
                id=msg["id"],
                thread_id=msg.get("threadId"),
                from_address=headers.get("from", ""),
                subject=headers.get("subject", "(no subject)"),
                snippet=msg.get("snippet", ""),
                received_at=received_at,
            )
        )

    return {
        "messages": messages,
        "next_page_token": next_page_token,
    }


def fetch_email_detail(access_token: str, message_id: str) -> EmailDetail:
    service = build_gmail_client(access_token)
    msg = (
        service.users()
        .messages()
        .get(userId="me", id=message_id, format="full")
        .execute()
    )
    payload = msg.get("payload", {})
    headers = _parse_email_headers(payload.get("headers", []))

    received_at = headers.get("date", "")
    try:
        parsed_dt = email.utils.parsedate_to_datetime(received_at)
        received_at = parsed_dt.astimezone(timezone.utc).isoformat()
    except (ValueError, TypeError):
        pass

    body_text = _parse_mime_body(payload)

    return EmailDetail(
        id=msg["id"],
        thread_id=msg.get("threadId"),
        from_address=headers.get("from", ""),
        to_address=headers.get("to"),
        subject=headers.get("subject", "(no subject)"),
        snippet=msg.get("snippet", ""),
        received_at=received_at,
        body_text=body_text,
    )
