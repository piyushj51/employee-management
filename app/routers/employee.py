from fastapi import APIRouter, status, Depends
from app.dependencies import get_current_user, require_admin
from app.schemas.users import User
from app.services import employee_service
from app.schemas.employee import EmployeeResponse, Employee, EmployeeUpdate, EmployeeCreate
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

@router.get('/')
def root():
    return {"message": "Employee API is running"}

@router.post('/employee', response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    return employee_service.add_employee(db, employee)

@router.get("/employees", response_model=list[Employee])
def get_employees(current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    return employee_service.get_all_employees(db)

@router.get("/employee/{employee_id}", response_model=Employee)
def fetch_employee(employee_id: int, current_user: Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    return employee_service.get_employee(employee_id, db)

@router.put('/employee/{employee_id}', response_model=Employee)
def edit_employee(employee_id: int, updated_employee:EmployeeUpdate, current_user: Employee = Depends(get_current_user), db: Session= Depends(get_db)):
    return employee_service.update_employee(employee_id, updated_employee, db)

@router.delete('/employee/{employee_id}')
def remove_employee(employee_id: int, current_user: User = Depends(require_admin), db: Session= Depends(get_db)):
    return employee_service.delete_employee(employee_id,db)


