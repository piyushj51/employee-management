from app.schemas.employee import Employee

def find_employee(employee_id: int, employees: list[Employee]):
    for employee in employees:
        if employee.id == employee_id:
            return employee

    return None
