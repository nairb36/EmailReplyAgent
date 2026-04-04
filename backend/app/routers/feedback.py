from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.feedback import FeedbackRequest, FeedbackResponse
from app.services import supabase_service

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse)
async def submit_feedback(
    request: FeedbackRequest,
    user: dict = Depends(get_current_user),
):
    # Check if feedback already exists for this draft
    existing = supabase_service.get_feedback_by_draft(request.draft_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Feedback already submitted for this draft",
        )

    try:
        record = supabase_service.create_feedback(
            user_id=user["id"],
            draft_id=request.draft_id,
            rating=request.rating,
            comment=request.comment,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save feedback: {str(e)}",
        )

    return FeedbackResponse(
        id=record["id"],
        draft_id=record["draft_id"],
        rating=record["rating"],
        comment=record.get("comment"),
        created_at=record["created_at"],
    )
