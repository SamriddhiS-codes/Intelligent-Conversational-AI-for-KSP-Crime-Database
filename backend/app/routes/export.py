from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..services.pdf_service import generate_chat_pdf
from ..middleware.auth_middleware import get_current_user
from ..models.user import User

router = APIRouter(prefix="/export", tags=["Export"])

class ExportRequest(BaseModel):
    conversation: list[dict]
    query_results: Optional[list[dict]] = None

@router.post("/pdf")
def export_pdf(
    body: ExportRequest,
    current_user: User = Depends(get_current_user)
):
    pdf_bytes = generate_chat_pdf(body.conversation, body.query_results)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ksp-crime-report.pdf"}
    )
