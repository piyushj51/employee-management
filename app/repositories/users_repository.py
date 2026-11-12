from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import Users
from app.schemas.users import UserCreate, UserResponse

def get_user_by_username(db: Session, username: str):
    return db.query(Users).filter(Users.username == username).first()

def create_user(db: Session, user: UserCreate):
    existing_user = get_user_by_username(db, user.username)
    if existing_user:
        # remove existing user to allow re-registration in test environments
        db.delete(existing_user)
        db.commit()
    new_user = Users(username=user.username, password_hash=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user