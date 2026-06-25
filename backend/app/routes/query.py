from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..controllers import query_controller
from ..middleware.auth_middleware import get_current_user
from ..models.user import User

router = APIRouter(prefix="/query", tags=["Query"])

class QueryRequest(BaseModel):
    question: str
    conversation_history: Optional[list[dict]] = []

@router.post("/")
def run_query(
    body: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return query_controller.handle_query(db, body.question, body.conversation_history)
