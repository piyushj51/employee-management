from sqlalchemy import Column, Integer, String
from app.database import Base

class Employee(Base):

    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(String)

    experience = Column(Integer)

    technology = Column(String)

    email = Column(String)

    department = Column(String, nullable=True)