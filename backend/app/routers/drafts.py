from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.draft import DraftRequest, DraftResponse
from app.services import auth_service, gmail_service, llm_service

router = APIRouter(prefix="/api/drafts", tags=["drafts"])


@router.post("", response_model=DraftResponse)
async def generate_draft(
    request: DraftRequest,
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

    # Fetch the email to reply to
    try:
        email_detail = gmail_service.fetch_email_detail(
            access_token=access_token,
            message_id=request.message_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch email: {str(e)}",
        )

    # Generate the draft reply
    try:
        draft_body = llm_service.generate_draft(
            api_key=request.openai_api_key,
            from_address=email_detail.from_address,
            to_address=email_detail.to_address,
            subject=email_detail.subject,
            body_text=email_detail.body_text,
            user_name=user.get("name"),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate draft: {str(e)}",
        )

    # Reply subject
    subject = email_detail.subject
    if not subject.lower().startswith("re:"):
        subject = f"Re: {subject}"

    return DraftResponse(
        message_id=request.message_id,
        draft_body=draft_body,
        subject=subject,
        to_address=email_detail.from_address,
    )
