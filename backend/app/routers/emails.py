from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user
from app.models.email import EmailDetail, EmailSummary
from app.services import auth_service, gmail_service

router = APIRouter(prefix="/api/emails", tags=["emails"])


@router.get("")
async def list_emails(
    max_results: int = Query(default=20, ge=1, le=100),
    page_token: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
):
    encrypted_token = user.get("google_access_token")
    if not encrypted_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No Google access token found",
        )

    try:
        access_token = auth_service.decrypt_token(encrypted_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to decrypt access token",
        )

    try:
        result = gmail_service.fetch_inbox(
            access_token=access_token,
            max_results=max_results,
            page_token=page_token,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch emails from Gmail: {str(e)}",
        )

    return {
        "messages": [msg.model_dump() for msg in result["messages"]],
        "next_page_token": result["next_page_token"],
    }


@router.get("/{message_id}", response_model=EmailDetail)
async def get_email_detail(
    message_id: str,
    user: dict = Depends(get_current_user),
):
    encrypted_token = user.get("google_access_token")
    if not encrypted_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No Google access token found",
        )

    try:
        access_token = auth_service.decrypt_token(encrypted_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to decrypt access token",
        )

    try:
        email_detail = gmail_service.fetch_email_detail(
            access_token=access_token,
            message_id=message_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch email detail from Gmail: {str(e)}",
        )

    return email_detail
