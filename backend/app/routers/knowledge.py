from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.knowledge import KBCreateRequest, KBItem, KBListResponse
from app.services import embedding_service, supabase_service

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


@router.get("", response_model=KBListResponse)
async def list_kb_items(user: dict = Depends(get_current_user)):
    items = supabase_service.get_kb_items(user["id"])
    return KBListResponse(
        items=[
            KBItem(
                id=item["id"],
                title=item["title"],
                content=item["content"],
                created_at=item["created_at"],
            )
            for item in items
        ]
    )


@router.post("", response_model=KBItem)
async def create_kb_item(
    request: KBCreateRequest,
    user: dict = Depends(get_current_user),
):
    # Generate embedding for the content
    try:
        embedding = embedding_service.get_embedding(
            api_key=request.openai_api_key,
            text=f"{request.title}\n\n{request.content}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate embedding: {str(e)}",
        )

    try:
        item = supabase_service.create_kb_item(
            user_id=user["id"],
            title=request.title,
            content=request.content,
            embedding=embedding,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store knowledge item: {str(e)}",
        )

    return KBItem(
        id=item["id"],
        title=item["title"],
        content=item["content"],
        created_at=item["created_at"],
    )


@router.delete("/{item_id}")
async def delete_kb_item(
    item_id: str,
    user: dict = Depends(get_current_user),
):
    deleted = supabase_service.delete_kb_item(item_id, user["id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge item not found",
        )
    return {"success": True}
