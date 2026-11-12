from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import auth_service
from app.schemas.users import UserCreate, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.login_user(db, user.username, user.password)


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user.username, user.password)