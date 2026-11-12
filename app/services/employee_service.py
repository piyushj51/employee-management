from fastapi import FastAPI, HTTPException, Depends
from app.utils.employee import find_employee
from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.models.employee import Employee as EmployeeModel
from sqlalchemy.orm import Session
from app.repositories import employee_repository

employees = []

def get_all_employees(db: Session):
    return employee_repository.get_employees(db)

def add_employee(db: Session, employee: EmployeeCreate):
    existing_employee = employee_repository.get_employee_by_email(employee.email, db)
    if existing_employee is not None:
        raise HTTPException(
            status_code=409,
            detail="Employee already exists"
        )

    try:
        return employee_repository.add_employee(employee, db)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Server Error"
        )

def get_employee(employee_id: int, db: Session):
    employee = employee_repository.get_employee_by_id(employee_id, db)
    if employee != None:
        return employee

    raise HTTPException(
        status_code=404,
        detail="Employee not found"
    )

def update_employee(employee_id: int, updated_employee: EmployeeUpdate, db: Session):
    employee = employee_repository.get_employee_by_id(employee_id, db)
    if employee is not None:
        employee_repository.update_employee(employee, updated_employee, db)
        return employee

    raise HTTPException(
        status_code=404,
        detail="Record not found"
    )

def delete_employee(employee_id: int, db: Session):
    try:
        employee_repository.delete_employee(employee_id, db)
        return {
            "message":"Employee deleted"
        }
    except:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )