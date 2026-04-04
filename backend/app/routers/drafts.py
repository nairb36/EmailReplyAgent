from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.draft import DraftRequest, DraftResponse, SendRequest, SendResponse
from app.services import auth_service, embedding_service, gmail_service, llm_service, supabase_service

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

    # RAG: retrieve relevant knowledge base context
    rag_context = None
    try:
        query_text = f"{email_detail.subject}\n{email_detail.body_text}"
        query_embedding = embedding_service.get_embedding(
            api_key=request.openai_api_key,
            text=query_text,
        )
        rag_results = supabase_service.search_kb(
            user_id=user["id"],
            query_embedding=query_embedding,
        )
        if rag_results:
            rag_context = [
                {"title": r["title"], "content": r["content"]}
                for r in rag_results
            ]
    except Exception:
        pass  # RAG is best-effort; continue without it

    # Generate the draft reply
    try:
        result = llm_service.generate_draft(
            api_key=request.openai_api_key,
            from_address=email_detail.from_address,
            to_address=email_detail.to_address,
            subject=email_detail.subject,
            body_text=email_detail.body_text,
            user_name=user.get("name"),
            rag_context=rag_context,
        )
        draft_body = result["draft"]
        llm_context = result["llm_context"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate draft: {str(e)}",
        )

    # Reply subject
    subject = email_detail.subject
    if not subject.lower().startswith("re:"):
        subject = f"Re: {subject}"

    # Store draft in Supabase
    try:
        draft_record = supabase_service.create_draft(
            user_id=user["id"],
            gmail_message_id=request.message_id,
            thread_id=email_detail.thread_id,
            to_address=email_detail.from_address,
            subject=subject,
            ai_draft_body=draft_body,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store draft: {str(e)}",
        )

    return DraftResponse(
        draft_id=draft_record["id"],
        message_id=request.message_id,
        thread_id=email_detail.thread_id,
        draft_body=draft_body,
        subject=subject,
        to_address=email_detail.from_address,
        llm_context=llm_context,
    )


@router.post("/send", response_model=SendResponse)
async def send_draft(
    request: SendRequest,
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

    # Send via Gmail API
    try:
        result = gmail_service.send_reply(
            access_token=access_token,
            to_address=request.to_address,
            subject=request.subject,
            body_text=request.final_body,
            thread_id=request.thread_id,
            message_id=request.message_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send email: {str(e)}",
        )

    # Update draft record with final body and sent timestamp
    try:
        supabase_service.update_draft_sent(
            draft_id=request.draft_id,
            final_body=request.final_body,
            sent_at=datetime.now(timezone.utc),
        )
    except Exception as e:
        # Email was sent but DB update failed — log but don't fail the request
        print(f"Warning: Failed to update draft record: {e}")

    return SendResponse(
        success=True,
        gmail_message_id=result.get("id", ""),
        draft_id=request.draft_id,
    )
