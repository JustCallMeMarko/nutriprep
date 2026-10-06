import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..ai.agent import run_chat
from ..database.models import get_db
from ..schemas.chat import ChatRequest
from ..utils import authenticate_and_get_user_details

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", status_code=status.HTTP_200_OK)
async def chat(
    payload: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    authenticate_and_get_user_details(request)
    try:
        reply = await run_chat(
            db,
            payload.message.strip(),
            [item.model_dump() for item in payload.history],
        )
    except Exception:
        logger.exception("PrepAI request failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI assistant is temporarily unavailable. Please try again.",
        )
    return {"reply": reply}
