from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.users import Users
from app.security import create_access_token, verify_password, hash_password
from app.repositories import users_repository
from app.schemas.users import UserCreate


def login_user(db: Session, username: str, password: str):
    user = users_repository.get_user_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    if not verify_password(password, str(user.password_hash)):
        raise HTTPException(
            status_code=400,
            detail="Invalid password",
        )
    token = create_access_token({
        "sub": user.username
    })

    return {
        "token_type": "bearer",
        "access_token": token
    }

def register_user(db: Session, username: str, password: str):
    # repository will handle existing-user replacement in test/dev environments
    hashed_password = hash_password(password)
    user = users_repository.create_user(db, UserCreate(username=username, password=hashed_password))
    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "username": user.username,
        },
    }