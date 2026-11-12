from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200

def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "password": "TestPassword123"
        }
    )

    assert response.status_code == 201

def test_login_user():
    response = client.post(
        "/auth/login",
        json={
            "username": "testuser",
            "password": "TestPassword123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_employees_without_token():
    response = client.get("/employees")

    assert response.status_code == 401