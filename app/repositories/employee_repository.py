from sqlalchemy.orm import Session
from app.models.employee import Employee

def get_employees(db: Session):
    return db.query(Employee).all()

def add_employee(employee, db: Session):
    db_employee = Employee(
            **employee.model_dump()
        )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def get_employee_by_id(employee_id, db: Session):
    return db.query(Employee).filter(Employee.id == employee_id).first()

def get_employee_by_email(email: str, db: Session):
    return db.query(Employee).filter(Employee.email == email).first()

def update_employee(employee, updated_employee, db):
    employee.name = updated_employee.name
    employee.experience = updated_employee.experience
    employee.technology = updated_employee.technology
    employee.email = updated_employee.email
    db.commit()
    db.refresh(employee)

def delete_employee(employee_id, db: Session):
    employee = get_employee_by_id(employee_id, db)
    db.delete(employee)
    db.commit()
