from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from ..database import get_db
from ..controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "investigator"

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return auth_controller.login(db, body.username, body.password)

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return auth_controller.register(db, body.username, body.email, body.password, body.role)
