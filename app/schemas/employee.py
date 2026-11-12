from typing import Optional
from pydantic import Field, BaseModel, EmailStr

class Employee(BaseModel):
    id: Optional[int] = None
    name: str = Field(min_length = 2, max_length = 50, description="Employee Name")
    experience: int = Field(ge=0, le=50, description="Employee's total work experience")
    technology: str = Field(min_length = 2, max_length = 50, description="Technology used")
    email: EmailStr

    model_config = {
        "from_attributes": True
    }

class EmployeeResponse(BaseModel):
    id: int

    model_config = {
        "from_attributes": True
    }


class EmployeeCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50, description="Employee Name")
    experience: int = Field(ge=0, le=50, description="Employee's total work experience")
    technology: str = Field(min_length=2, max_length=50, description="Technology used")
    email: EmailStr

class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50, description="Employee Name")
    experience: Optional[int] = Field(None, ge=0, le=50, description="Employee's total work experience")
    technology: Optional[str] = Field(None, min_length=2, max_length=50, description="Technology used")
    email: Optional[EmailStr] = None

employees = []