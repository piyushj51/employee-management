from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.employee import router as employee_router
from app.routers.auth import router as auth_router
from app.database import Base,engine
from app.models.employee import Employee
from app.models.users import Users

# Automatically create tables in the database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_router)
app.include_router(auth_router)