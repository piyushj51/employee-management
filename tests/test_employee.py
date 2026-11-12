from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_user_cannot_delete_employee():
    # login as normal user
    login_response = client.post(
        "/auth/login",
        json={
            "username": "testuser",
            "password": "TestPassword123"
        }
    )

    token = login_response.json()["access_token"]

    response = client.delete(
        "/employee/1",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403